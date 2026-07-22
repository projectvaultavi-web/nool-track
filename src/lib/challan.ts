import { prisma } from './prisma';
import { format } from 'date-fns';

export async function generateChallanNumber(organizationId: string): Promise<string> {
  const now = new Date();
  const prefix = 'NT';
    const yearMonth = format(now, 'yyyyMM');

  const lastJob = await prisma.job.findFirst({
    where: {
      organizationId,
      challanNumber: { startsWith: `${prefix}-${yearMonth}-` },
    },
    orderBy: { challanNumber: 'desc' },
    select: { challanNumber: true },
  });

  let nextNumber = 1;
  if (lastJob) {
    const parts = lastJob.challanNumber.split('-');
    const lastNum = parseInt(parts[parts.length - 1] ?? '0', 10);
    nextNumber = lastNum + 1;
  }

  return `${prefix}-${yearMonth}-${String(nextNumber).padStart(4, '0')}`;
}

export async function generatePONumber(organizationId: string): Promise<string> {
  const now = new Date();
  const prefix = 'PO';
  const yearMonth = format(now, 'yyyyMM');

  const lastPO = await prisma.productionOrder.findFirst({
    where: {
      organizationId,
      orderNumber: { startsWith: `${prefix}-${yearMonth}-` },
    },
    orderBy: { orderNumber: 'desc' },
    select: { orderNumber: true },
  });

  let nextNumber = 1;
  if (lastPO) {
    const parts = lastPO.orderNumber.split('-');
    const lastNum = parseInt(parts[parts.length - 1] ?? '0', 10);
    nextNumber = lastNum + 1;
  }

  return `${prefix}-${yearMonth}-${String(nextNumber).padStart(4, '0')}`;
}
