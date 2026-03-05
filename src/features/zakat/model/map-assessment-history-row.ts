import type { AssessmentSnapshot } from '@/features/zakat/model/assessment-history'
import { getAssessmentHistory } from '@/server/functions/zakat/get-assessment-history'

type AssessmentHistoryRow = Awaited<ReturnType<typeof getAssessmentHistory>>['items'][number]

export function mapAssessmentHistoryRowToSnapshot(row: AssessmentHistoryRow): AssessmentSnapshot {
  return {
    id: row.id,
    assessmentAt: row.assessmentAt.toISOString(),
    inputs: {
      cash: row.cash,
      gold: row.gold,
      silver: row.silver,
      investments: row.investments,
      businessAssets: row.businessAssets,
      receivables: row.receivables,
      debtsDue: row.debtsDue,
      otherLiabilities: row.otherLiabilities,
      nisab: row.nisabValue,
    },
    totalAssets: row.totalAssets,
    totalLiabilities: row.totalLiabilities,
    netWorth: row.netZakatableWealth,
    nisabValue: row.nisabValue,
    nisabState: row.nisabState,
    zakatDue: row.zakatDueNow,
  }
}
