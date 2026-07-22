import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';

const updateJobSchema = z.object({
  status: z.enum([
    'CREATED', 'DISPATCHED', 'IN_PROGRESS', 'PARTIALLY_RETURNED', 
    'RETURNED', 'QUALITY_CHECK', 'APPROVED', 'COMPLETED', 'CANCELLED'
  ]).optional(),
  transportCost: z.number().optional().nullable(),
  vehicleNumber: z.string().optional().nullable(),
  driverName: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
});

// GET /api/jobs/[id]
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

    const job = await prisma.job.findUnique({
      where: {
        id,
        organizationId: user.organizationId
      },
      include: {
        contractor: true,
        returns: {
          orderBy: { returnDate: 'desc' }
        },
        stage: {
          include: {
            productionOrder: {
              select: { id: true, orderNumber: true, styleNumber: true, status: true }
            }
          }
        }
      }
    });

    if (!job) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 });
    }

    return NextResponse.json(job);
  } catch (error) {
    console.error('Error fetching job:', error);
    return NextResponse.json({ error: 'Failed to fetch job' }, { status: 500 });
  }
}

// PUT /api/jobs/[id]
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
    const result = updateJobSchema.safeParse(json);

    if (!result.success) {
      return NextResponse.json({ error: 'Validation failed', details: result.error.errors }, { status: 400 });
    }

    const existingJob = await prisma.job.findUnique({
      where: { id, organizationId: user.organizationId },
      include: { stage: true }
    });

    if (!existingJob) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 });
    }

    const updatedJob = await prisma.$transaction(async (tx) => {
      const job = await tx.job.update({
        where: { id },
        data: result.data
      });

      // If status changed and linked to a PO, log it
      if (result.data.status && result.data.status !== existingJob.status && existingJob.stage?.productionOrderId) {
        await tx.activityLog.create({
          data: {
            organizationId: user.organizationId!,
            productionOrderId: existingJob.stage.productionOrderId,
            userId: user.id,
            actionType: 'JOB_STATUS_CHANGED',
            description: `Job ${existingJob.challanNumber} status changed from ${existingJob.status} to ${result.data.status}`,
            previousStatus: existingJob.status,
            newStatus: result.data.status
          }
        });
      }

      return job;
    });

    return NextResponse.json(updatedJob);
  } catch (error) {
    console.error('Error updating job:', error);
    return NextResponse.json({ error: 'Failed to update job' }, { status: 500 });
  }
}

// DELETE /api/jobs/[id]
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

    const existingJob = await prisma.job.findUnique({
      where: { id, organizationId: user.organizationId },
      include: { returns: true }
    });

    if (!existingJob) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 });
    }

    if (existingJob.returns.length > 0) {
      return NextResponse.json({ error: 'Cannot delete job with recorded returns. Cancel it instead.' }, { status: 400 });
    }

    await prisma.job.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting job:', error);
    return NextResponse.json({ error: 'Failed to delete job' }, { status: 500 });
  }
}
