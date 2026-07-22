import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';

const createOrderSchema = z.object({
  buyerId: z.string().uuid().optional().nullable(),
  styleNumber: z.string().optional().nullable(),
  description: z.string().min(1, 'Description is required'),
  materialType: z.string().optional().nullable(),
  color: z.string().optional().nullable(),
  gsm: z.number().optional().nullable(),
  totalQuantity: z.number().positive(),
  unit: z.enum(['METERS', 'PIECES', 'KILOGRAMS', 'YARDS', 'SETS']),
  deadline: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
  stages: z.array(z.object({
    processType: z.enum(['CUTTING', 'DYEING', 'PRINTING', 'EMBROIDERY', 'STITCHING', 'WASHING', 'FINISHING', 'OTHER']),
    sequenceNumber: z.number().int().min(1)
  })).min(1, 'At least one stage is required')
});

// GET /api/orders
export async function GET(request: NextRequest) {
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

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    const where = {
      organizationId: user.organizationId,
      ...(status && status !== 'ALL' ? { status: status as any /* eslint-disable-line @typescript-eslint/no-explicit-any */ } : {}),
      ...(search ? {
        OR: [
          { orderNumber: { contains: search, mode: 'insensitive' as const } },
          { description: { contains: search, mode: 'insensitive' as const } },
          { styleNumber: { contains: search, mode: 'insensitive' as const } },
          { buyerName: { contains: search, mode: 'insensitive' as const } }
        ]
      } : {})
    };

    const [orders, total] = await Promise.all([
      prisma.productionOrder.findMany({
        where,
        include: {
          stages: {
            orderBy: { sequenceNumber: 'asc' },
            include: {
              jobs: {
                select: {
                  quantitySent: true,
                  quantityReturned: true
                }
              }
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.productionOrder.count({ where })
    ]);

    return NextResponse.json({
      data: orders,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      }
    });
  } catch (error) {
    console.error('Error fetching production orders:', error);
    return NextResponse.json({ error: 'Failed to fetch production orders' }, { status: 500 });
  }
}

// POST /api/orders
export async function POST(request: NextRequest) {
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

    const json = await request.json();
    const result = createOrderSchema.safeParse(json);

    if (!result.success) {
      return NextResponse.json({ error: 'Validation failed', details: result.error.errors }, { status: 400 });
    }

    const data = result.data;

    // Snapshot buyer if provided
    let buyerSnapshot: any /* eslint-disable-line @typescript-eslint/no-explicit-any */ = {};
    if (data.buyerId) {
      const buyer = await prisma.buyer.findUnique({
        where: { id: data.buyerId, organizationId: user.organizationId }
      });
      if (buyer) {
        buyerSnapshot = {
          buyerName: buyer.name,
          buyerCompanyName: buyer.companyName,
          buyerContactPerson: buyer.contactPerson,
          buyerPhone: buyer.phone,
          buyerEmail: buyer.email,
          buyerGstNumber: buyer.gstNumber,
          buyerAddress: buyer.address
        };
      }
    }

    // Generate Order Number
    const count = await prisma.productionOrder.count({
      where: { organizationId: user.organizationId }
    });
    const nextNum = (count + 1).toString().padStart(6, '0');
    const orderNumber = `NT-${new Date().getFullYear()}-${nextNum}`;

    // Process stages logic: Stage 1 is READY, rest are LOCKED
    const sortedStages = data.stages.sort((a, b) => a.sequenceNumber - b.sequenceNumber);
    const stagesToCreate = sortedStages.map((s, index) => ({
      processType: s.processType,
      sequenceNumber: s.sequenceNumber,
      status: index === 0 ? 'READY' as const : 'LOCKED' as const
    }));

    // Perform inside a transaction
    const order = await prisma.$transaction(async (tx) => {
      const newOrder = await tx.productionOrder.create({
        data: {
          organizationId: user.organizationId,
          createdById: user.id,
          orderNumber,
          buyerId: data.buyerId,
          ...buyerSnapshot,
          styleNumber: data.styleNumber,
          description: data.description,
          materialType: data.materialType,
          color: data.color,
          gsm: data.gsm,
          totalQuantity: data.totalQuantity,
          unit: data.unit,
          deadline: data.deadline ? new Date(data.deadline) : null,
          notes: data.notes,
          status: 'DRAFT',
          stages: {
            create: stagesToCreate
          }
        },
        include: {
          stages: true
        }
      });

      // Create Activity Log
      await tx.activityLog.create({
        data: {
          organizationId: user.organizationId,
          productionOrderId: newOrder.id,
          userId: user.id,
          actionType: 'PO_CREATED',
          description: `Production Order ${orderNumber} created`,
          newStatus: 'DRAFT'
        }
      });

      return newOrder;
    });

    return NextResponse.json(order, { status: 201 });
  } catch (error) {
    console.error('Error creating production order:', error);
    return NextResponse.json({ error: 'Failed to create production order' }, { status: 500 });
  }
}
