import type { BenchmarkPricingCurrency } from "./benchmark-pricing.constants"

export type BenchmarkPricingRecord = {
  currency: BenchmarkPricingCurrency
  provider: string
  goldPrice: string
  silverPrice: string
  sourceTimestamp: Date
  lastSuccessfulAt: Date
  createdAt: Date
  updatedAt: Date
}

export type BenchmarkPricingSnapshot = {
  currency: BenchmarkPricingCurrency
  provider: string
  goldPrice: string
  silverPrice: string
  sourceTimestamp: string | Date
  lastSuccessfulAt: string | Date
}

export type BenchmarkPricingRefreshOutcome = {
  record: BenchmarkPricingRecord | null
  refreshed: boolean
  error: string | null
}

