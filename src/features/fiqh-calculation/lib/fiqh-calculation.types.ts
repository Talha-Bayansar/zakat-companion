import type {
  FiqhCycleState,
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
