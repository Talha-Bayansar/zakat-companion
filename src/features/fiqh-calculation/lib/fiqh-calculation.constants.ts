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

export const fiqhCycleStateValues = [
  "open",
  "due",
  "paid",
  "followed_up",
] as const

export type FiqhCycleState = (typeof fiqhCycleStateValues)[number]
