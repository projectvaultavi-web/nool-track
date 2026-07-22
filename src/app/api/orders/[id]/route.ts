import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';

const updateOrderSchema = z.object({
  status: z.enum([
    'DRAFT', 'CONFIRMED', 'IN_PRODUCTION', 'QUALITY_CHECK',
    'READY_FOR_DISPATCH', 'DELIVERED', 'CLOSED', 'CANCELLED'
  ]).optional(),
  description: z.string().optional(),
  deadline: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
});

// GET /api/orders/[id]
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const supabase = await createClient();
    const { data: { user: authUser } } = await supabase.auth.getUser();
    
    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { supabaseAuthId: authUser.id },
      select: { organizationId: true }
    });

    if (!user?.organizationId) {
      return NextResponse.json({ error: 'Organization not found' }, { status: 404 });
    }

    const { id } = await params;

    const order = await prisma.productionOrder.findUnique({
      where: {
        id,
        organizationId: user.organizationId
      },
      include: {
        buyer: true,
        stages: {
          orderBy: { sequenceNumber: 'asc' },
          include: {
            jobs: {
              include: {
                contractor: {
                  select: { name: true, phone: true }
                }
              }
            }
          }
        },
        activityLogs: {
          orderBy: { createdAt: 'desc' },
          include: {
            user: { select: { name: true } }
          }
        }
      }
    });

    if (!order) {
      return NextResponse.json({ error: 'Production Order not found' }, { status: 404 });
    }

    return NextResponse.json(order);
  } catch (error) {
    console.error('Error fetching production order:', error);
    return NextResponse.json({ error: 'Failed to fetch production order' }, { status: 500 });
  }
}

// PUT /api/orders/[id]
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const supabase = await createClient();
    const { data: { user: authUser } } = await supabase.auth.getUser();
    
    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { supabaseAuthId: authUser.id },
      select: { id: true, organizationId: true }
    });

    if (!user?.organizationId) {
      return NextResponse.json({ error: 'Organization not found' }, { status: 404 });
    }

    const { id } = await params;
    const json = await request.json();
    const result = updateOrderSchema.safeParse(json);

    if (!result.success) {
      return NextResponse.json({ error: 'Validation failed', details: result.error.errors }, { status: 400 });
    }

    const existingOrder = await prisma.productionOrder.findUnique({
      where: { id, organizationId: user.organizationId }
    });

    if (!existingOrder) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    const updatedOrder = await prisma.$transaction(async (tx) => {
      const order = await tx.productionOrder.update({
        where: { id },
        data: {
          ...result.data,
          deadline: result.data.deadline ? new Date(result.data.deadline) : undefined,
        }
      });

      if (result.data.status && result.data.status !== existingOrder.status) {
        await tx.activityLog.create({
          data: {
            organizationId: user.organizationId!,
            productionOrderId: id,
            userId: user.id,
            actionType: 'PO_STATUS_CHANGED',
            description: `Order status changed from ${existingOrder.status} to ${result.data.status}`,
            previousStatus: existingOrder.status,
            newStatus: result.data.status
          }
        });
      }

      return order;
    });

    return NextResponse.json(updatedOrder);
  } catch (error) {
    console.error('Error updating production order:', error);
    return NextResponse.json({ error: 'Failed to update production order' }, { status: 500 });
  }
}

// DELETE /api/orders/[id]
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const supabase = await createClient();
    const { data: { user: authUser } } = await supabase.auth.getUser();
    
    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { supabaseAuthId: authUser.id },
      select: { id: true, organizationId: true }
    });

    if (!user?.organizationId) {
      return NextResponse.json({ error: 'Organization not found' }, { status: 404 });
    }

    const { id } = await params;

    const existingOrder = await prisma.productionOrder.findUnique({
      where: { id, organizationId: user.organizationId },
      include: { stages: { include: { jobs: true } } }
    });

    if (!existingOrder) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // Check if jobs exist
    const hasJobs = existingOrder.stages.some(s => s.jobs.length > 0);
    if (hasJobs) {
      return NextResponse.json({ error: 'Cannot delete order with active jobs. Cancel it instead.' }, { status: 400 });
    }

    await prisma.$transaction(async (tx) => {
      await tx.activityLog.deleteMany({ where: { productionOrderId: id } });
      await tx.productionOrder.delete({ where: { id } });
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting production order:', error);
    return NextResponse.json({ error: 'Failed to delete production order' }, { status: 500 });
  }
}
