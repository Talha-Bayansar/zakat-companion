import { m } from "@/paraglide/messages"

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

export const WEALTH_SNAPSHOT_CALCULATION_VERSION = "wealth-snapshot-v1"
const SNAPSHOT_NISAB_THRESHOLD_CENTS = 0

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
  const isAboveNisab = netZakatableBase > SNAPSHOT_NISAB_THRESHOLD_CENTS

  return {
    madhab: null,
    nisabBenchmark: null,
    calculationVersion: WEALTH_SNAPSHOT_CALCULATION_VERSION,
    netZakatableBase: formatCents(netZakatableBase),
    isAboveNisab,
    isZakatDue: null,
  }
}

async function requireCurrentActiveProfileId(actor: Actor) {
  const { resolveCurrentActiveProfile } = await import(
    "@/features/profiles/server/services/profile-access.service"
  )

  const activeProfile = await resolveCurrentActiveProfile(actor)

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
): Promise<WealthSnapshotWithEntriesRecord | null> {
  const profileId = await requireCurrentActiveProfileId(actor)

  if (!profileId) {
    throw new Error(m.wealth_snapshot_no_active_profile())
  }

  const snapshot = calculateWealthSnapshotWriteContext(input.entries)
  const entries = normalizeWealthSnapshotEntries(input.entries)

  return replaceWealthSnapshotRecord({
    profileId,
    entries,
    snapshot,
  })
}
