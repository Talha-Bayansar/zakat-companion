import type { StoredFinancialValues } from './financial-values'
import type { ZakatCalculationResult } from './calculate-zakat'

export type NisabState = 'ABOVE' | 'BELOW'

export type AssessmentSnapshot = {
  id: string
  assessmentAt: string
  inputs: {
    cash: string
    gold: string
    silver: string
    investments: string
    businessAssets: string
    receivables: string
    debtsDue: string
    otherLiabilities: string
    nisab: string
  }
  totalAssets: string
  totalLiabilities: string
  netWorth: string
  nisabValue: string
  nisabState: NisabState
  zakatDue: string
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
  return []
}

export function saveAssessmentSnapshot(_snapshot: AssessmentSnapshot) {
  // Intentionally no-op during reset phase.
}
