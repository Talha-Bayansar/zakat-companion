import { createServerFn } from '@tanstack/react-start'
import { and, desc, eq, or } from 'drizzle-orm'
import { z } from 'zod'
import { db } from '@/server/db'
import { zakatAssessments, zakatCycles, zakatEvents } from '@/server/db/schema'

const inputSchema = z.object({
  userId: z.string().min(1),
  limit: z.number().int().min(1).max(50).optional(),
})


export const getLifecycleOverview = createServerFn({ method: 'POST' })
  .inputValidator(inputSchema)
  .handler(async ({ data }) => {
    const limit = data.limit ?? 20

    const [latestAssessment, activeCycle, events] = await Promise.all([
      db.query.zakatAssessments.findFirst({
        where: eq(zakatAssessments.userId, data.userId),
        orderBy: [desc(zakatAssessments.assessmentAt), desc(zakatAssessments.createdAt)],
      }),
      db.query.zakatCycles.findFirst({
        where: and(eq(zakatCycles.userId, data.userId), eq(zakatCycles.status, 'running')),
        orderBy: [desc(zakatCycles.startedAt)],
      }),
      db.query.zakatEvents.findMany({
        where: and(
          eq(zakatEvents.userId, data.userId),
          or(
            eq(zakatEvents.eventType, 'state_above'),
            eq(zakatEvents.eventType, 'state_below'),
            eq(zakatEvents.eventType, 'cycle_start'),
            eq(zakatEvents.eventType, 'cycle_end'),
          ),
        ),
        orderBy: [desc(zakatEvents.eventAt), desc(zakatEvents.createdAt)],
        limit,
      }),
    ])

    return {
      currentNisabState: latestAssessment?.nisabState ?? 'BELOW',
      hasActiveCycle: Boolean(activeCycle),
      activeCycle: activeCycle
        ? {
            id: activeCycle.id,
            startedAt: activeCycle.startedAt,
            nextDueAt: activeCycle.nextDueAt,
            ruleProfile: activeCycle.ruleProfile,
          }
        : null,
      timeline: events.map((event) => ({
        id: event.id,
        type: event.eventType,
        eventAt: event.eventAt,
        cycleId: event.cycleId,
      })),
    }
  })
