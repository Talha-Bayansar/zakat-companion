import { describe, expect, it, vi } from "vitest"

vi.mock("@/paraglide/runtime", () => ({
  getLocale: () => "en",
}))

vi.mock("@/paraglide/messages", () => ({
  m: {
    settings_active_profile_fiqh_benchmark_freshness_value: ({
      relativeTime,
    }: {
      relativeTime: string
    }) => `Freshness: ${relativeTime}`,
  },
}))

import {
  getBenchmarkPricingFreshnessLabel,
  isBenchmarkPricingStale,
} from "./benchmark-pricing.labels"

describe("benchmark pricing labels", () => {
  it("formats the user-facing freshness label from the last successful update", () => {
    expect(
      getBenchmarkPricingFreshnessLabel(
        {
          lastSuccessfulAt: new Date("2026-05-18T10:00:00.000Z"),
        },
        new Date("2026-05-18T12:00:00.000Z"),
      ),
    ).toBe("Freshness: 2 hours ago")
  })

  it("marks benchmark pricing stale after the 24 hour freshness window", () => {
    const lastSuccessfulAt = new Date("2026-05-18T12:00:00.000Z")
    const referenceTime = new Date("2026-05-19T13:00:00.000Z")

    expect(
      getBenchmarkPricingFreshnessLabel(
        { lastSuccessfulAt },
        referenceTime,
      ),
    ).toBe("Freshness: yesterday")
    expect(isBenchmarkPricingStale({ lastSuccessfulAt }, referenceTime)).toBe(true)
  })
})
