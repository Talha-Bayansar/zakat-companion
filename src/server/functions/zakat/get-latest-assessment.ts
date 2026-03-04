import { createServerFn } from '@tanstack/react-start'
import { and, desc, eq } from 'drizzle-orm'
import { z } from 'zod'
import { db } from '@/server/db'
import { zakatAssessments, zakatCycles } from '@/server/db/schema'

const latestAssessmentInput = z.object({
  userId: z.string().min(1),
})

export const getLatestAssessment = createServerFn({ method: 'POST' })
  .inputValidator(latestAssessmentInput)
  .handler(async ({ data }) => {
    const [latestAssessment, activeCycle] = await Promise.all([
      db.query.zakatAssessments.findFirst({
        where: eq(zakatAssessments.userId, data.userId),
        orderBy: [desc(zakatAssessments.assessmentAt), desc(zakatAssessments.createdAt)],
      }),
      db.query.zakatCycles.findFirst({
        where: and(eq(zakatCycles.userId, data.userId), eq(zakatCycles.status, 'running')),
        orderBy: [desc(zakatCycles.startedAt)],
      }),
    ])

    if (!latestAssessment) {
      return {
        amountDue: '0.00',
        aboveNisab: false,
        nisabState: 'BELOW' as const,
        nextDueAt: null,
        assessmentAt: null,
      }
    }

    return {
      amountDue: latestAssessment.zakatDueNow,
      aboveNisab: latestAssessment.nisabState === 'ABOVE',
      nisabState: latestAssessment.nisabState,
      nextDueAt: activeCycle?.nextDueAt ?? null,
      assessmentAt: latestAssessment.assessmentAt,
    }
  })
