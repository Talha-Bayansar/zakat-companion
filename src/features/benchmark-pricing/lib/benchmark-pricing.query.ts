import { queryOptions, useQuery } from "@tanstack/react-query"

import { getCurrentBenchmarkPricingFn } from "../server/functions/benchmark-pricing.function"

export const benchmarkPricingQueryKey = ["benchmark-pricing"] as const

export const currentBenchmarkPricingQueryKey = [
  ...benchmarkPricingQueryKey,
  "current",
] as const

export function currentBenchmarkPricingQueryOptions() {
  return queryOptions({
    queryKey: currentBenchmarkPricingQueryKey,
    queryFn: async () => getCurrentBenchmarkPricingFn(),
  })
}

export function useCurrentBenchmarkPricingQuery() {
  return useQuery(currentBenchmarkPricingQueryOptions())
}

