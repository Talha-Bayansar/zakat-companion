export const benchmarkPricingCurrencyValues = ["EUR"] as const

export type BenchmarkPricingCurrency =
  (typeof benchmarkPricingCurrencyValues)[number]

export const benchmarkPricingProvider = "metals.dev" as const

export const benchmarkPricingRefreshCron = "0 2 * * *" as const

export const benchmarkPricingFreshnessThresholdMs = 24 * 60 * 60 * 1000

