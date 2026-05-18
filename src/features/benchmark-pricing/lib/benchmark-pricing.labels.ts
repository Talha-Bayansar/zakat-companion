import { getLocale } from "@/paraglide/runtime"
import { m } from "@/paraglide/messages"

import { benchmarkPricingFreshnessThresholdMs } from "./benchmark-pricing.constants"
import type { BenchmarkPricingRecord } from "./benchmark-pricing.types"

function getRelativeTimeLabel(from: Date | string, to = new Date()) {
  const startedAt = from instanceof Date ? from : new Date(from)
  const elapsedMs = Math.max(0, to.getTime() - startedAt.getTime())
  const elapsedMinutes = Math.floor(elapsedMs / (60 * 1000))
  const formatter = new Intl.RelativeTimeFormat(getLocale(), {
    numeric: "auto",
  })

  if (elapsedMinutes < 60) {
    return formatter.format(-elapsedMinutes, "minute")
  }

  const elapsedHours = Math.floor(elapsedMinutes / 60)

  if (elapsedHours < 24) {
    return formatter.format(-elapsedHours, "hour")
  }

  const elapsedDays = Math.floor(elapsedHours / 24)
  return formatter.format(-elapsedDays, "day")
}

export function getBenchmarkPricingFreshnessLabel(
  benchmarkPricing: Pick<BenchmarkPricingRecord, "lastSuccessfulAt">,
  referenceTime = new Date(),
) {
  return m.settings_active_profile_fiqh_benchmark_freshness_value({
    relativeTime: getRelativeTimeLabel(
      benchmarkPricing.lastSuccessfulAt,
      referenceTime,
    ),
  })
}

export function isBenchmarkPricingStale(
  benchmarkPricing: Pick<BenchmarkPricingRecord, "lastSuccessfulAt">,
  referenceTime = new Date(),
) {
  return (
    referenceTime.getTime() - benchmarkPricing.lastSuccessfulAt.getTime() >
    benchmarkPricingFreshnessThresholdMs
  )
}
