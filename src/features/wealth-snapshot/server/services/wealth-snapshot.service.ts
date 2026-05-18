import { m } from "@/paraglide/messages"
import { getBenchmarkPricingFreshnessLabel, isBenchmarkPricingStale } from "@/features/benchmark-pricing"
import {
  getCurrentBenchmarkPricing,
  refreshCurrentBenchmarkPricing,
} from "@/features/benchmark-pricing/server"
import {
  calculateFiqhCalculation,
  type FiqhCalculationBenchmarkExplanation,
  type FiqhCalculationOutcome,
  type FiqhMadhabCode,
  type FiqhNisabBenchmarkCode,
  fiqhCalculationVersion,
} from "@/features/fiqh-calculation"

import { wealthCategoryValues } from "../../lib/wealth-snapshot.constants"
import {
  getWealthSnapshotWithEntriesRecordByProfileId,
  listWealthSnapshotHistoryRecordsByProfileId,
  replaceWealthSnapshotRecord,
  type WealthSnapshotHistoryPage,
  type WealthSnapshotWriteContext,
  type WealthSnapshotWithEntriesRecord,
} from "../repositories/wealth-snapshot.repository"
import type {
  ListWealthSnapshotHistoryInput,
  WealthCategory,
  WealthSnapshotEntryInput,
} from "../schemas/wealth-snapshot.schema"

type Actor = {
  userId: string
  activeProfileId: string | null
}

type ReplaceWealthSnapshotInput = {
  entries: WealthSnapshotEntryInput[]
}

type ActiveProfileFiqhPreferences = {
  madhab: FiqhMadhabCode
  nisabBenchmark: FiqhNisabBenchmarkCode
}

export const WEALTH_SNAPSHOT_CALCULATION_VERSION = "wealth-snapshot-v1"
const SNAPSHOT_FALLBACK_NISAB_THRESHOLD_CENTS = 1

const ASSET_CATEGORIES: WealthCategory[] = wealthCategoryValues.filter(
  (category) => category !== "debts_liabilities",
)

function parseAmountToCents(amount: string) {
  const normalized = amount.trim()

  if (!normalized) {
    return 0
  }

  const [wholePart = "0", fractionPart = ""] = normalized.split(".")
  const whole = Number.parseInt(wholePart, 10)
  const fraction = Number.parseInt(`${fractionPart}00`.slice(0, 2), 10)

  return (
    (Number.isFinite(whole) ? whole : 0) * 100 +
    (Number.isFinite(fraction) ? fraction : 0)
  )
}

function formatCents(value: number) {
  const absoluteValue = Math.abs(value)
  const whole = Math.trunc(absoluteValue / 100)
  const fraction = String(absoluteValue % 100).padStart(2, "0")

  return `${value < 0 ? "-" : ""}${whole}.${fraction}`
}

function getBenchmarkThreshold(
  benchmarkPricing: Awaited<ReturnType<typeof getCurrentBenchmarkPricing>>,
  benchmark: FiqhNisabBenchmarkCode,
) {
  if (!benchmarkPricing) {
    return null
  }

  return benchmark === "gold"
    ? benchmarkPricing.goldPrice
    : benchmarkPricing.silverPrice
}

function toBenchmarkExplanation(
  benchmarkPricing: NonNullable<
    Awaited<ReturnType<typeof getCurrentBenchmarkPricing>>
  >,
  benchmark: FiqhNisabBenchmarkCode,
  nisabThreshold: string,
  asOf: Date,
): FiqhCalculationBenchmarkExplanation {
  const selectedBenchmarkPrice = getBenchmarkThreshold(benchmarkPricing, benchmark)

  return {
    currency: benchmarkPricing.currency,
    provider: benchmarkPricing.provider,
    goldPrice: benchmarkPricing.goldPrice,
    silverPrice: benchmarkPricing.silverPrice,
    sourceTimestamp: benchmarkPricing.sourceTimestamp.toISOString(),
    lastSuccessfulAt: benchmarkPricing.lastSuccessfulAt.toISOString(),
    selectedBenchmark: benchmark,
    selectedBenchmarkPrice: selectedBenchmarkPrice ?? nisabThreshold,
    nisabThreshold,
    freshness: {
      isStale: isBenchmarkPricingStale(benchmarkPricing, asOf),
      label: getBenchmarkPricingFreshnessLabel(benchmarkPricing, asOf),
    },
  }
}

export function normalizeWealthSnapshotEntries(entries: WealthSnapshotEntryInput[]) {
  const entriesByCategory = new Map<WealthCategory, string>()

  for (const entry of entries) {
    entriesByCategory.set(entry.category, entry.amount.trim() || "0")
  }

  return wealthCategoryValues.map((category) => ({
    category,
    amount: entriesByCategory.get(category) ?? "0",
  }))
}

export function calculateWealthSnapshotWriteContext(
  entries: WealthSnapshotEntryInput[],
): WealthSnapshotWriteContext {
  const normalizedEntries = normalizeWealthSnapshotEntries(entries)
  const assetTotal = normalizedEntries
    .filter((entry) => ASSET_CATEGORIES.includes(entry.category))
    .reduce((total, entry) => total + parseAmountToCents(entry.amount), 0)
  const liabilityTotal = normalizedEntries
    .filter((entry) => entry.category === "debts_liabilities")
    .reduce((total, entry) => total + parseAmountToCents(entry.amount), 0)
  const netZakatableBase = assetTotal - liabilityTotal
  const isAboveNisab =
    netZakatableBase > SNAPSHOT_FALLBACK_NISAB_THRESHOLD_CENTS

  return {
    madhab: null,
    nisabBenchmark: null,
    calculationVersion: WEALTH_SNAPSHOT_CALCULATION_VERSION,
    netZakatableBase: formatCents(netZakatableBase),
    isAboveNisab,
    isZakatDue: null,
    fiqhExplanation: null,
  }
}

type BenchmarkAwareFiqhCalculationOutcome = FiqhCalculationOutcome & {
  explanation: FiqhCalculationOutcome["explanation"] & {
    benchmark: FiqhCalculationBenchmarkExplanation
  }
}

async function calculateFiqhWealthSnapshotOutcome(
  entries: WealthSnapshotEntryInput[],
  activeProfile: ActiveProfileFiqhPreferences | null,
  benchmarkPricing: Awaited<ReturnType<typeof getCurrentBenchmarkPricing>> | null,
  asOf: Date,
): Promise<BenchmarkAwareFiqhCalculationOutcome | WealthSnapshotWriteContext> {
  const snapshot = calculateWealthSnapshotWriteContext(entries)

  if (!activeProfile) {
    return snapshot
  }

  if (!benchmarkPricing) {
    throw new Error(m.wealth_snapshot_benchmark_unavailable())
  }

  const nisabThreshold = getBenchmarkThreshold(
    benchmarkPricing,
    activeProfile.nisabBenchmark,
  )

  if (!nisabThreshold) {
    throw new Error(m.wealth_snapshot_benchmark_unavailable())
  }

  const outcome = calculateFiqhCalculation({
    madhab: activeProfile.madhab,
    nisabBenchmark: activeProfile.nisabBenchmark,
    netZakatableBase: snapshot.netZakatableBase ?? "0.00",
    nisabThreshold,
    hawlStartedAt: null,
    asOf,
    calculationVersion: fiqhCalculationVersion,
  })

  return {
    ...outcome,
    explanation: {
      ...outcome.explanation,
      benchmark: toBenchmarkExplanation(
        benchmarkPricing,
        activeProfile.nisabBenchmark,
        nisabThreshold,
        asOf,
      ),
    },
  }
}

async function getBootstrapBenchmarkPricing(
  benchmarkPricingApiKey: string | undefined,
  now: Date,
) {
  const currentBenchmarkPricing = await getCurrentBenchmarkPricing()

  if (currentBenchmarkPricing) {
    return currentBenchmarkPricing
  }

  const outcome = await refreshCurrentBenchmarkPricing({
    apiKey: benchmarkPricingApiKey,
    now,
  })

  return outcome.record
}

function toWealthSnapshotWriteContext(
  outcome:
    | BenchmarkAwareFiqhCalculationOutcome
    | FiqhCalculationOutcome
    | WealthSnapshotWriteContext,
): WealthSnapshotWriteContext {
  if ("snapshot" in outcome) {
    return {
      ...outcome.snapshot,
      fiqhExplanation: outcome.explanation,
    }
  }

  return outcome
}

async function saveWealthSnapshotRevision(
  actor: Actor,
  input: ReplaceWealthSnapshotInput,
  options: {
    benchmarkPricingApiKey?: string
  } = {},
) {
  const activeProfile = await requireCurrentActiveProfile(actor)
  const profileId = activeProfile?.id ?? null

  if (!profileId || !activeProfile) {
    throw new Error(m.wealth_snapshot_no_active_profile())
  }

  const capturedAt = new Date()
  const benchmarkPricing = await getBootstrapBenchmarkPricing(
    options.benchmarkPricingApiKey,
    capturedAt,
  )

  if (!benchmarkPricing) {
    throw new Error(m.wealth_snapshot_benchmark_unavailable())
  }

  const outcome = await calculateFiqhWealthSnapshotOutcome(
    input.entries,
    {
      madhab: activeProfile.madhab,
      nisabBenchmark: activeProfile.nisabBenchmark,
    },
    benchmarkPricing,
    capturedAt,
  )
  const snapshot = toWealthSnapshotWriteContext(outcome)
  const entries = normalizeWealthSnapshotEntries(input.entries)

  return replaceWealthSnapshotRecord({
    profileId,
    entries,
    snapshot,
    capturedAt,
  })
}

async function requireCurrentActiveProfile(actor: Actor) {
  const { resolveCurrentActiveProfile } = await import(
    "@/features/profiles/server/services/profile-access.service"
  )

  return resolveCurrentActiveProfile(actor)
}

async function requireCurrentActiveProfileId(actor: Actor) {
  const activeProfile = await requireCurrentActiveProfile(actor)

  return activeProfile?.id ?? null
}

export async function getCurrentWealthSnapshot(actor: Actor) {
  const profileId = await requireCurrentActiveProfileId(actor)

  if (!profileId) {
    return null
  }

  return getWealthSnapshotWithEntriesRecordByProfileId(profileId)
}

export async function listWealthSnapshotHistory(
  actor: Actor,
  input: ListWealthSnapshotHistoryInput,
): Promise<WealthSnapshotHistoryPage> {
  const profileId = await requireCurrentActiveProfileId(actor)

  if (!profileId) {
    return {
      items: [],
      page: input.page,
      pageSize: input.pageSize,
      hasMore: false,
    }
  }

  return listWealthSnapshotHistoryRecordsByProfileId(profileId, input)
}

export async function replaceWealthSnapshot(
  actor: Actor,
  input: ReplaceWealthSnapshotInput,
  options: {
    benchmarkPricingApiKey?: string
  } = {},
): Promise<WealthSnapshotWithEntriesRecord | null> {
  return saveWealthSnapshotRevision(actor, input, options)
}

export async function refreshWealthSnapshot(
  actor: Actor,
  input: ReplaceWealthSnapshotInput,
  options: {
    benchmarkPricingApiKey?: string
  } = {},
): Promise<WealthSnapshotWithEntriesRecord | null> {
  return saveWealthSnapshotRevision(actor, input, options)
}
