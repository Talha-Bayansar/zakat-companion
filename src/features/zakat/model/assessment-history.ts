import { z } from 'zod'
import type { StoredFinancialValues } from './financial-values'
import type { ZakatCalculationResult } from './calculate-zakat'

const STORAGE_KEY = 'zakat-companion.assessment-history.v1'

const nisabStateSchema = z.enum(['ABOVE', 'BELOW'])

const assessmentSnapshotSchema = z.object({
  id: z.string(),
  assessmentAt: z.string(),
  inputs: z.object({
    cash: z.string(),
    gold: z.string(),
    silver: z.string(),
    investments: z.string(),
    businessAssets: z.string(),
    receivables: z.string(),
    debtsDue: z.string(),
    otherLiabilities: z.string(),
    nisab: z.string(),
  }),
  totalAssets: z.string(),
  totalLiabilities: z.string(),
  netWorth: z.string(),
  nisabValue: z.string(),
  nisabState: nisabStateSchema,
  zakatDue: z.string(),
})

const assessmentHistorySchema = z.array(assessmentSnapshotSchema)

export type NisabState = z.infer<typeof nisabStateSchema>
export type AssessmentSnapshot = z.infer<typeof assessmentSnapshotSchema>

function hasWindow() {
  return typeof window !== 'undefined'
}

function createId() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }

  return `${Date.now()}-${Math.random().toString(36).slice(2)}`
}

export function createAssessmentSnapshot(input: {
  values: StoredFinancialValues
  result: ZakatCalculationResult
  assessmentAt?: string
}): AssessmentSnapshot {
  const { values, result } = input

  return {
    id: createId(),
    assessmentAt: input.assessmentAt ?? new Date().toISOString(),
    inputs: {
      cash: values.cash,
      gold: values.gold,
      silver: values.silver,
      investments: values.investments,
      businessAssets: values.businessAssets,
      receivables: values.receivables,
      debtsDue: values.debtsDue,
      otherLiabilities: values.otherLiabilities,
      nisab: values.nisab,
    },
    totalAssets: result.totalAssets.toFixed(),
    totalLiabilities: result.totalLiabilities.toFixed(),
    netWorth: result.netWorth.toFixed(),
    nisabValue: result.nisab.toFixed(),
    nisabState: result.isEligible ? 'ABOVE' : 'BELOW',
    zakatDue: result.zakatDue.toFixed(),
  }
}

export function getAssessmentHistory(): AssessmentSnapshot[] {
  if (!hasWindow()) return []

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return []

    const parsed = assessmentHistorySchema.safeParse(JSON.parse(raw))
    if (!parsed.success) return []

    return parsed.data
  } catch {
    return []
  }
}

export function saveAssessmentSnapshot(snapshot: AssessmentSnapshot) {
  if (!hasWindow()) return

  const next = [snapshot, ...getAssessmentHistory()].sort(
    (a, b) => new Date(b.assessmentAt).getTime() - new Date(a.assessmentAt).getTime(),
  )

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
}
