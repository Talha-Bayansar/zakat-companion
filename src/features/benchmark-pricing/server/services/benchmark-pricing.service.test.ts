// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from "vitest"

import type { BenchmarkPricingRecord } from "../../lib/benchmark-pricing.types"

const getCurrentBenchmarkPricingRecord = vi.fn()
const upsertCurrentBenchmarkPricingRecord = vi.fn()

vi.mock("../repositories/benchmark-pricing.repository", () => ({
  getCurrentBenchmarkPricingRecord: getCurrentBenchmarkPricingRecord,
  upsertCurrentBenchmarkPricingRecord: upsertCurrentBenchmarkPricingRecord,
}))

import {
  fetchLatestBenchmarkPricing,
  refreshCurrentBenchmarkPricing,
} from "./benchmark-pricing.service"

describe("benchmark pricing service", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("fetches EUR gold and silver prices from Metals.dev", async () => {
    const fetchImpl = vi.fn(
      async (_input: RequestInfo | URL, _init?: RequestInit) => {
      return new Response(
        JSON.stringify({
          status: "success",
          timestamp: "2026-05-18T12:00:00.000Z",
          currency: "EUR",
          unit: "toz",
          metals: {
            gold: 3000.12,
            silver: 35.45,
          },
        }),
        {
          status: 200,
          headers: {
            "content-type": "application/json",
          },
        },
      )
      },
    )

    const record = await fetchLatestBenchmarkPricing(fetchImpl, "test-key")

    expect(record).toEqual({
      currency: "EUR",
      provider: "metals.dev",
      goldPrice: "3000.12",
      silverPrice: "35.45",
      sourceTimestamp: new Date("2026-05-18T12:00:00.000Z"),
      lastSuccessfulAt: new Date("2026-05-18T12:00:00.000Z"),
    })
    expect(fetchImpl).toHaveBeenCalledTimes(1)
    const request = fetchImpl.mock.calls.at(0)?.[0]

    expect(request).toBeInstanceOf(URL)
    expect(String(request)).toContain("https://api.metals.dev/v1/latest")
    expect(String(request)).toContain("currency=EUR")
    expect(String(request)).toContain("unit=toz")
  })

  it("stores the fetched benchmark and updates freshness metadata", async () => {
    const now = new Date("2026-05-18T12:30:00.000Z")
    const storedRecord: BenchmarkPricingRecord = {
      currency: "EUR",
      provider: "metals.dev",
      goldPrice: "2999.88",
      silverPrice: "35.01",
      sourceTimestamp: new Date("2026-05-18T12:00:00.000Z"),
      lastSuccessfulAt: now,
      createdAt: now,
      updatedAt: now,
    }
    const fetchImpl = vi.fn(
      async (_input: RequestInfo | URL, _init?: RequestInit) => {
      return new Response(
        JSON.stringify({
          status: "success",
          timestamp: "2026-05-18T12:00:00.000Z",
          currency: "EUR",
          unit: "toz",
          metals: {
            gold: 2999.88,
            silver: 35.01,
          },
        }),
        {
          status: 200,
          headers: {
            "content-type": "application/json",
          },
        },
      )
      },
    )

    upsertCurrentBenchmarkPricingRecord.mockResolvedValue(storedRecord)

    const outcome = await refreshCurrentBenchmarkPricing({
      fetchImpl,
      apiKey: "test-key",
      now,
    })

    expect(upsertCurrentBenchmarkPricingRecord).toHaveBeenCalledWith(
      {
        currency: "EUR",
        provider: "metals.dev",
        goldPrice: "2999.88",
        silverPrice: "35.01",
        sourceTimestamp: new Date("2026-05-18T12:00:00.000Z"),
        lastSuccessfulAt: new Date("2026-05-18T12:00:00.000Z"),
      },
      now,
    )
    expect(outcome).toEqual({
      record: storedRecord,
      refreshed: true,
      error: null,
    })
  })

  it("keeps the previous benchmark when Metals.dev fails", async () => {
    const existingRecord: BenchmarkPricingRecord = {
      currency: "EUR",
      provider: "metals.dev",
      goldPrice: "2800.00",
      silverPrice: "34.00",
      sourceTimestamp: new Date("2026-05-17T12:00:00.000Z"),
      lastSuccessfulAt: new Date("2026-05-17T12:00:00.000Z"),
      createdAt: new Date("2026-05-17T12:00:00.000Z"),
      updatedAt: new Date("2026-05-17T12:00:00.000Z"),
    }
    const fetchImpl = vi.fn(
      async (_input: RequestInfo | URL, _init?: RequestInit) => {
      return new Response("upstream error", {
        status: 503,
      })
      },
    )

    getCurrentBenchmarkPricingRecord.mockResolvedValue(existingRecord)

    const outcome = await refreshCurrentBenchmarkPricing({
      fetchImpl,
      apiKey: "test-key",
      now: new Date("2026-05-18T12:30:00.000Z"),
    })

    expect(upsertCurrentBenchmarkPricingRecord).not.toHaveBeenCalled()
    expect(getCurrentBenchmarkPricingRecord).toHaveBeenCalled()
    expect(outcome).toEqual({
      record: existingRecord,
      refreshed: false,
      error: "Metals.dev request failed with HTTP 503.",
    })
  })
})
