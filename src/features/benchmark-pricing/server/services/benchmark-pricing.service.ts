import { m } from "@/paraglide/messages"
import {
  benchmarkPricingCurrencyValues,
  benchmarkPricingProvider,
} from "../../lib/benchmark-pricing.constants"
import type { BenchmarkPricingCurrency } from "../../lib/benchmark-pricing.constants"
import type {
  BenchmarkPricingRecord,
  BenchmarkPricingRefreshOutcome,
  BenchmarkPricingSnapshot,
} from "../../lib/benchmark-pricing.types"

type MetalsDevLatestResponse = {
  status: "success" | "failure"
  currency: string
  unit: string
  metals: {
    gold: number
    silver: number
  }
  timestamp?: string
  timestamps?: {
    metal?: string
    currency?: string
  }
}

function getCurrencyFromResponse(value: string): BenchmarkPricingCurrency {
  if (
    !benchmarkPricingCurrencyValues.includes(value as BenchmarkPricingCurrency)
  ) {
    throw new Error(`Unsupported benchmark currency: ${value}`)
  }

  return value as BenchmarkPricingCurrency
}

function toBenchmarkPricingSnapshot(
  response: MetalsDevLatestResponse,
): BenchmarkPricingSnapshot {
  if (response.unit !== "g") {
    throw new Error(`Metals.dev returned unexpected unit: ${response.unit}`)
  }

  const sourceTimestamp =
    response.timestamps?.currency ??
    response.timestamps?.metal ??
    response.timestamp

  return {
    currency: getCurrencyFromResponse(response.currency),
    provider: benchmarkPricingProvider,
    goldPrice: String(response.metals.gold),
    silverPrice: String(response.metals.silver),
    sourceTimestamp: new Date(sourceTimestamp ?? new Date().toISOString()),
    lastSuccessfulAt: new Date(sourceTimestamp ?? new Date().toISOString()),
  }
}

export async function fetchLatestBenchmarkPricing(
  fetchImpl: typeof fetch = fetch,
  apiKey?: string
) {
  if (!apiKey) {
    throw new Error("Metals.dev API key is not configured.")
  }

  const url = new URL("https://api.metals.dev/v1/latest")
  url.searchParams.set("api_key", apiKey)
  url.searchParams.set("currency", benchmarkPricingCurrencyValues[0])
  url.searchParams.set("unit", "g")

  const response = await fetchImpl(url, {
    headers: {
      accept: "application/json",
    },
  })

  if (!response.ok) {
    throw new Error(`Metals.dev request failed with HTTP ${response.status}.`)
  }

  const body = (await response.json()) as MetalsDevLatestResponse

  if (body.status !== "success") {
    throw new Error("Metals.dev returned an unsuccessful response.")
  }

  return toBenchmarkPricingSnapshot(body)
}

export async function getCurrentBenchmarkPricing(
  currency: BenchmarkPricingCurrency = benchmarkPricingCurrencyValues[0]
): Promise<BenchmarkPricingRecord | null> {
  const { getCurrentBenchmarkPricingRecord } =
    await import("../repositories/benchmark-pricing.repository")

  return getCurrentBenchmarkPricingRecord(currency)
}

export async function getBootstrapBenchmarkPricing(
  options: {
    fetchImpl?: typeof fetch
    apiKey?: string
    now?: Date
    currency?: BenchmarkPricingCurrency
  } = {}
): Promise<BenchmarkPricingRecord | null> {
  const currency = options.currency ?? benchmarkPricingCurrencyValues[0]
  const currentBenchmarkPricing = await getCurrentBenchmarkPricing(currency)

  if (currentBenchmarkPricing) {
    return currentBenchmarkPricing
  }

  const outcome = await refreshCurrentBenchmarkPricing({
    fetchImpl: options.fetchImpl,
    apiKey: options.apiKey,
    now: options.now,
  })

  return outcome.record
}

export async function refreshCurrentBenchmarkPricing(
  options: {
    fetchImpl?: typeof fetch
    apiKey?: string
    now?: Date
  } = {}
): Promise<BenchmarkPricingRefreshOutcome> {
  const now = options.now ?? new Date()
  try {
    const benchmarkPricing = await fetchLatestBenchmarkPricing(
      options.fetchImpl ?? fetch,
      options.apiKey
    )
    const { upsertCurrentBenchmarkPricingRecord } =
      await import("../repositories/benchmark-pricing.repository")
    const record = await upsertCurrentBenchmarkPricingRecord(
      benchmarkPricing,
      now
    )

    return {
      record,
      refreshed: true,
      error: null,
    }
  } catch (error) {
    const record = await getCurrentBenchmarkPricing()

    return {
      record,
      refreshed: false,
      error: m.benchmark_pricing_refresh_failed(),
    }
  }
}
