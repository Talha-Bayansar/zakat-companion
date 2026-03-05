import { createServerFn } from '@tanstack/react-start'
import { and, eq } from 'drizzle-orm'
import { z } from 'zod'
import { db } from '@/server/db'
import { zakatAssessments } from '@/server/db/schema'

const assessmentByIdInput = z.object({
  userId: z.string().min(1),
  assessmentId: z.string().min(1),
})

export const getAssessmentById = createServerFn({ method: 'POST' })
  .inputValidator(assessmentByIdInput)
  .handler(async ({ data }) => {
    const [item] = await db
      .select({
        id: zakatAssessments.id,
        assessmentAt: zakatAssessments.assessmentAt,
        cash: zakatAssessments.cash,
        gold: zakatAssessments.gold,
        silver: zakatAssessments.silver,
        investments: zakatAssessments.investments,
        businessAssets: zakatAssessments.businessAssets,
        receivables: zakatAssessments.receivables,
        debtsDue: zakatAssessments.debtsDue,
        otherLiabilities: zakatAssessments.otherLiabilities,
        totalAssets: zakatAssessments.totalAssets,
        totalLiabilities: zakatAssessments.totalLiabilities,
        netZakatableWealth: zakatAssessments.netZakatableWealth,
        nisabValue: zakatAssessments.nisabValue,
        zakatDueNow: zakatAssessments.zakatDueNow,
        nisabState: zakatAssessments.nisabState,
      })
      .from(zakatAssessments)
      .where(and(eq(zakatAssessments.userId, data.userId), eq(zakatAssessments.id, data.assessmentId)))
      .limit(1)

    return item ?? null
  })
