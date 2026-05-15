import type {
  FiqhCycleState,
  FiqhDateRulePolicy,
  FiqhMadhabCode,
  FiqhNisabBenchmarkCode,
} from "./fiqh-calculation.constants"

export type FiqhPreferenceSelection = {
  madhab: FiqhMadhabCode
  nisabBenchmark: FiqhNisabBenchmarkCode
}

export type FiqhCalculationContext = {
  madhab: FiqhMadhabCode | null
  nisabBenchmark: FiqhNisabBenchmarkCode | null
  calculationVersion: string
}

export type FiqhCalculationResult = {
  netZakatableBase: string
  isAboveNisab: boolean
  isZakatDue: boolean | null
}

export type FiqhCalculationSnapshot = FiqhCalculationContext &
  FiqhCalculationResult

export type FiqhCycleLifecycle = FiqhCycleState

export type FiqhCalculationInput = {
  madhab: FiqhMadhabCode
  nisabBenchmark: FiqhNisabBenchmarkCode
  netZakatableBase: string
  nisabThreshold: string
  hawlStartedAt: Date | null
  asOf: Date
  calculationVersion?: string
}

export type FiqhDateRule = {
  policy: FiqhDateRulePolicy
  summary: string
}

export type FiqhCalculationExplanationInputs = {
  madhab: FiqhMadhabCode
  nisabBenchmark: FiqhNisabBenchmarkCode
  netZakatableBase: string
  nisabThreshold: string
  hawlStartedAt: string | null
  asOf: string
}

export type FiqhCalculationNisabExplanation = {
  netZakatableBase: string
  nisabThreshold: string
  difference: string
  isAboveNisab: boolean
}

export type FiqhCalculationHawlExplanation = {
  startedAt: string | null
  asOf: string
  elapsedDays: number | null
  requiredDays: number
  isComplete: boolean
  resetRequired: boolean
}

export type FiqhCalculationDueAmountExplanation = {
  rate: string
  amount: string
  isZakatDue: boolean
}

export type FiqhCalculationExplanation = {
  inputs: FiqhCalculationExplanationInputs
  nisab: FiqhCalculationNisabExplanation
  hawl: FiqhCalculationHawlExplanation
  dueAmount: FiqhCalculationDueAmountExplanation
  dateRule: FiqhDateRule
}

export type FiqhHawlProgress = {
  startedAt: Date | null
  asOf: Date
  elapsedDays: number | null
  requiredDays: number
  isComplete: boolean
  resetRequired: boolean
}

export type FiqhCalculationOutcome = {
  snapshot: FiqhCalculationSnapshot
  nisabThreshold: string
  nisabDifference: string
  zakatRate: string
  zakatDueAmount: string
  dateRule: FiqhDateRule
  hawl: FiqhHawlProgress
  explanation: FiqhCalculationExplanation
}
