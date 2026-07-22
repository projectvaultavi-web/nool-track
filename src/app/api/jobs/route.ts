import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';

const createJobSchema = z.object({
  stageId: z.string().uuid().optional().nullable(),
  contractorId: z.string().uuid(),
  processType: z.enum(['CUTTING', 'DYEING', 'PRINTING', 'EMBROIDERY', 'STITCHING', 'WASHING', 'FINISHING', 'OTHER']),
  materialDescription: z.string().min(1),
  lotNumber: z.string().optional().nullable(),
  quantitySent: z.number().positive(),
  unit: z.enum(['METERS', 'PIECES', 'KILOGRAMS', 'YARDS', 'SETS']),
  
  rate: z.number().positive().optional().nullable(),
  rateType: z.enum(['PER_UNIT', 'FIXED']).optional().nullable(),
  unitRate: z.number().positive().optional().nullable(),
  amount: z.number().positive().optional().nullable(),
  
  transportCost: z.number().optional().nullable(),
  vehicleNumber: z.string().optional().nullable(),
  driverName: z.string().optional().nullable(),
  
  expectedReturnDate: z.string(),
  notes: z.string().optional().nullable(),
});

// GET /api/jobs
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
    const stageId = searchParams.get('stageId');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    const where = {
      organizationId: user.organizationId,
      ...(status && status !== 'ALL' ? { status: status as any } : {}),
      ...(stageId ? { stageId } : {}),
      ...(search ? {
        OR: [
          { challanNumber: { contains: search, mode: 'insensitive' as const } },
          { materialDescription: { contains: search, mode: 'insensitive' as const } },
          { contractorName: { contains: search, mode: 'insensitive' as const } }
        ]
      } : {})
    };

    const [jobs, total] = await Promise.all([
      prisma.job.findMany({
        where,
        include: {
          contractor: { select: { name: true, phone: true } },
          stage: {
            include: {
              productionOrder: {
                select: { orderNumber: true, styleNumber: true }
              }
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.job.count({ where })
    ]);

    return NextResponse.json({
      data: jobs,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      }
    });
  } catch (error) {
    console.error('Error fetching jobs:', error);
    return NextResponse.json({ error: 'Failed to fetch jobs' }, { status: 500 });
  }
}

// POST /api/jobs
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
    const result = createJobSchema.safeParse(json);

    if (!result.success) {
      return NextResponse.json({ error: 'Validation failed', details: result.error.errors }, { status: 400 });
    }

    const data = result.data;

    // Snapshot contractor
    const contractor = await prisma.contractor.findUnique({
      where: { id: data.contractorId, organizationId: user.organizationId }
    });

    if (!contractor) {
      return NextResponse.json({ error: 'Contractor not found' }, { status: 404 });
    }

    const contractorSnapshot = {
      contractorName: contractor.name,
      contractorPhone: contractor.phone,
      contractorAddress: contractor.address,
      contractorGstNumber: contractor.gstNumber
    };

    // Generate Challan Number
    const count = await prisma.job.count({
      where: { organizationId: user.organizationId }
    });
    const nextNum = (count + 1).toString().padStart(6, '0');
    const challanNumber = `NT-CH-${new Date().getFullYear()}-${nextNum}`;

    const job = await prisma.$transaction(async (tx) => {
      // Create job
      const newJob = await tx.job.create({
        data: {
          organizationId: user.organizationId,
          createdById: user.id,
          challanNumber,
          stageId: data.stageId,
          contractorId: data.contractorId,
          ...contractorSnapshot,
          processType: data.processType,
          materialDescription: data.materialDescription,
          lotNumber: data.lotNumber,
          quantitySent: data.quantitySent,
          unit: data.unit,
          rate: data.rate,
          rateType: data.rateType,
          unitRate: data.unitRate,
          amount: data.amount,
          transportCost: data.transportCost,
          vehicleNumber: data.vehicleNumber,
          driverName: data.driverName,
          expectedReturnDate: new Date(data.expectedReturnDate),
          notes: data.notes,
          status: 'CREATED'
        }
      });

      // Update stage status if linked
      if (data.stageId) {
        const stage = await tx.productionStage.findUnique({
          where: { id: data.stageId },
          include: { productionOrder: true }
        });
        
        if (stage && stage.status === 'READY') {
          await tx.productionStage.update({
            where: { id: data.stageId },
            data: { 
              status: 'IN_PROGRESS',
              startDate: new Date()
            }
          });
          
          if (stage.productionOrder.status === 'CONFIRMED' || stage.productionOrder.status === 'DRAFT') {
            await tx.productionOrder.update({
              where: { id: stage.productionOrderId },
              data: { status: 'IN_PRODUCTION' }
            });

            await tx.activityLog.create({
              data: {
                organizationId: user.organizationId,
                productionOrderId: stage.productionOrderId,
                userId: user.id,
                actionType: 'PO_STATUS_CHANGED',
                description: `Order moved to IN_PRODUCTION (First job dispatched for ${stage.processType})`,
                previousStatus: stage.productionOrder.status,
                newStatus: 'IN_PRODUCTION'
              }
            });
          }
        }
      }

      return newJob;
    });

    return NextResponse.json(job, { status: 201 });
  } catch (error) {
    console.error('Error creating job:', error);
    return NextResponse.json({ error: 'Failed to create job' }, { status: 500 });
  }
}
