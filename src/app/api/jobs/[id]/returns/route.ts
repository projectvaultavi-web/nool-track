import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';

const createReturnSchema = z.object({
  quantityReturned: z.number().nonnegative(),
  qualityGrade: z.enum(['A', 'B', 'C', 'REJECTED']),
  rejectionQuantity: z.number().nonnegative().optional().default(0),
  returnDate: z.string().optional(),
  qualityNotes: z.string().optional().nullable(),
  receivedBy: z.string().optional().nullable(),
  receivedDate: z.string().optional().nullable(),
  remarks: z.string().optional().nullable(),
});

// POST /api/jobs/[id]/returns
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
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

    const { id: jobId } = await params;
    const json = await request.json();
    const result = createReturnSchema.safeParse(json);

    if (!result.success) {
      return NextResponse.json({ error: 'Validation failed', details: result.error.errors }, { status: 400 });
    }

    const data = result.data;

    const existingJob = await prisma.job.findUnique({
      where: { id: jobId, organizationId: user.organizationId },
      include: {
        stage: {
          include: {
            productionOrder: true,
            jobs: {
              select: {
                id: true,
                quantitySent: true,
                quantityReturned: true,
                rejectionQuantity: true,
                wastageQuantity: true,
                status: true
              }
            }
          }
        }
      }
    });

    if (!existingJob) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 });
    }

    const jobReturn = await prisma.$transaction(async (tx) => {
      // 1. Create the Return record
      const newReturn = await tx.jobReturn.create({
        data: {
          organizationId: user.organizationId!,
          jobId: jobId,
          recordedById: user.id,
          quantityReturned: data.quantityReturned,
          qualityGrade: data.qualityGrade,
          rejectionQuantity: data.rejectionQuantity,
          qualityNotes: data.qualityNotes,
          receivedBy: data.receivedBy,
          receivedDate: data.receivedDate ? new Date(data.receivedDate) : new Date(),
          remarks: data.remarks,
          returnDate: data.returnDate ? new Date(data.returnDate) : new Date()
        }
      });

      // 2. Update Job Quantities
      // We must fetch current totals since parallel returns could theoretically happen
      const allReturns = await tx.jobReturn.findMany({ where: { jobId } });
      const totalReturned = allReturns.reduce((sum, r) => sum + Number(r.quantityReturned), 0);
      const totalRejection = allReturns.reduce((sum, r) => sum + Number(r.rejectionQuantity), 0);
      
      const sent = Number(existingJob.quantitySent);
      // Wastage is Sent - Returned. (If negative, zero it out or track over-return)
      const wastage = Math.max(0, sent - totalReturned);
      const wastagePercentage = sent > 0 ? (wastage / sent) * 100 : 0;

      // 3. Determine new Job Status
      let newJobStatus = existingJob.status;
      if (totalReturned > 0) {
        newJobStatus = 'PARTIALLY_RETURNED';
      }
      if (totalReturned >= sent) {
        newJobStatus = 'RETURNED'; // Returned fully
      }

      await tx.job.update({
        where: { id: jobId },
        data: {
          quantityReturned: totalReturned,
          rejectionQuantity: totalRejection,
          wastageQuantity: wastage,
          wastagePercentage: wastagePercentage,
          status: newJobStatus
        }
      });

      // Log Job Status Change if it changed
      if (newJobStatus !== existingJob.status && existingJob.stage) {
        await tx.activityLog.create({
          data: {
            organizationId: user.organizationId!,
            productionOrderId: existingJob.stage.productionOrderId,
            userId: user.id,
            actionType: 'JOB_STATUS_CHANGED',
            description: `Job ${existingJob.challanNumber} moved to ${newJobStatus} (Return of ${data.quantityReturned} recorded)`,
            previousStatus: existingJob.status,
            newStatus: newJobStatus
          }
        });
      }

      // 4. Update Stage Status if Linked
      if (existingJob.stage) {
        // Need to evaluate ALL jobs in this stage.
        // We inject our updated job values into the array to test state without requerying DB
        const updatedJobs = existingJob.stage.jobs.map(j => {
          if (j.id === jobId) {
            return { ...j, status: newJobStatus, quantityReturned: totalReturned, quantitySent: sent };
          }
          return j;
        });

        // Stage is COMPLETED if all jobs are RETURNED, COMPLETED, APPROVED, or CLOSED
        // (For simplicity, we check if all jobs are at least RETURNED)
        const completedStatuses = ['RETURNED', 'QUALITY_CHECK', 'APPROVED', 'COMPLETED', 'CLOSED'];
        const allJobsFinished = updatedJobs.length > 0 && updatedJobs.every(j => completedStatuses.includes(j.status));

        if (allJobsFinished && existingJob.stage.status !== 'COMPLETED') {
          // In the new flow, it goes to WAITING_APPROVAL, but for auto-flow let's push it there.
          const nextStageStatus = 'WAITING_APPROVAL';

          await tx.productionStage.update({
            where: { id: existingJob.stage.id },
            data: { 
              status: nextStageStatus,
              completedDate: nextStageStatus === 'COMPLETED' ? new Date() : null
            }
          });

          await tx.activityLog.create({
            data: {
              organizationId: user.organizationId!,
              productionOrderId: existingJob.stage.productionOrderId,
              userId: user.id,
              actionType: 'STAGE_COMPLETED',
              description: `Stage ${existingJob.stage.processType} is ${nextStageStatus} as all jobs are returned.`,
              previousStatus: existingJob.stage.status,
              newStatus: nextStageStatus
            }
          });
        }
      }

      return newReturn;
    });

    return NextResponse.json(jobReturn, { status: 201 });
  } catch (error) {
    console.error('Error recording return:', error);
    return NextResponse.json({ error: 'Failed to record return' }, { status: 500 });
  }
}
