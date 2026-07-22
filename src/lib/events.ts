import { prisma } from './prisma';
import { Prisma } from '@prisma/client';

type EventInput = {
  organizationId: string;
  eventType: string;
  entityType: string;
  entityId?: string;
  actorId: string;
  data: Prisma.InputJsonValue;
  metadata?: Prisma.InputJsonValue;
};

export async function emitEvent(input: EventInput): Promise<void> {
  try {
    await prisma.event.create({
      data: {
        organizationId: input.organizationId,
        eventType: input.eventType,
        entityType: input.entityType,
        entityId: input.entityId,
        actorId: input.actorId,
        data: input.data,
        metadata: input.metadata ?? {},
      },
    });
  } catch (error) {
    // Event emission should never break the main flow
    console.error('Failed to emit event:', error);
  }
}
