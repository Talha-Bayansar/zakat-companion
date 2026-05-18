export const fiqhMadhabCodeValues = [
  "hanafi",
  "maliki",
  "shafii",
  "hanbali",
] as const

export type FiqhMadhabCode = (typeof fiqhMadhabCodeValues)[number]

export const fiqhNisabBenchmarkCodeValues = ["gold", "silver"] as const

export type FiqhNisabBenchmarkCode =
  (typeof fiqhNisabBenchmarkCodeValues)[number]

export const fiqhGoldNisabGrams = 85 as const
export const fiqhSilverNisabGrams = 595 as const

export const fiqhCycleStateValues = [
  "open",
  "due",
  "paid",
  "followed_up",
  "reset",
] as const

export type FiqhCycleState = (typeof fiqhCycleStateValues)[number]

export const fiqhCalculationVersion = "fiqh-v1" as const

export const fiqhDateRulePolicyValues = ["reset", "preserve"] as const

export type FiqhDateRulePolicy =
  (typeof fiqhDateRulePolicyValues)[number]

export const fiqhHawlLengthDays = 354 as const

export const fiqhZakatRate = "0.025" as const
