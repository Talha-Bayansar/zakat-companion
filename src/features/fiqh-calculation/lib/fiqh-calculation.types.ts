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
}
