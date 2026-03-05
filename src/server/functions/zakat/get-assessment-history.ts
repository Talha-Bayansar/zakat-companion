import { createServerFn } from '@tanstack/react-start'
import { desc, eq } from 'drizzle-orm'
import { z } from 'zod'
import { db } from '@/server/db'
import { zakatAssessments } from '@/server/db/schema'

const assessmentHistoryInput = z.object({
  userId: z.string().min(1),
  limit: z.number().int().positive().max(100).optional(),
})

export const getAssessmentHistory = createServerFn({ method: 'POST' })
  .inputValidator(assessmentHistoryInput)
  .handler(async ({ data }) => {
    return db
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
      .where(eq(zakatAssessments.userId, data.userId))
      .orderBy(desc(zakatAssessments.assessmentAt), desc(zakatAssessments.createdAt))
      .limit(data.limit ?? 50)
  })
