import { asc, desc, eq, inArray } from "drizzle-orm"

import { db, type Database } from "@/server/db/client"
import { wealthSnapshot, wealthSnapshotEntry } from "@/server/db/schema"
import type { InfiniteListPage } from "@/shared/lib/infinite-list"
import type {
  FiqhCalculationExplanation,
  FiqhMadhabCode,
  FiqhNisabBenchmarkCode,
  FiqhCalculationSnapshot,
} from "@/features/fiqh-calculation"

import type {
  ListWealthSnapshotHistoryInput,
  WealthCategory,
  WealthSnapshotEntryInput,
} from "../schemas/wealth-snapshot.schema"

type DatabaseLike = Pick<
  Database,
  "select" | "insert" | "update" | "delete"
>

export type WealthSnapshotRecord = {
  id: string
  profileId: string
  capturedAt: Date
  madhab: FiqhMadhabCode | null
  nisabBenchmark: FiqhNisabBenchmarkCode | null
  calculationVersion: FiqhCalculationSnapshot["calculationVersion"] | null
  netZakatableBase: FiqhCalculationSnapshot["netZakatableBase"] | null
  isAboveNisab: FiqhCalculationSnapshot["isAboveNisab"] | null
  isZakatDue: FiqhCalculationSnapshot["isZakatDue"] | null
  fiqhExplanation: FiqhCalculationExplanation | null
  createdAt: Date
  updatedAt: Date
}

export type WealthSnapshotEntryRecord = {
  id: string
  snapshotId: string
  category: WealthCategory
  amount: string
  createdAt: Date
  updatedAt: Date
}

export type WealthSnapshotWithEntriesRecord = WealthSnapshotRecord & {
  entries: WealthSnapshotEntryRecord[]
}

export type WealthSnapshotHistoryPage = InfiniteListPage<WealthSnapshotWithEntriesRecord>

export type WealthSnapshotWriteContext = {
  madhab: FiqhMadhabCode | null
  nisabBenchmark: FiqhNisabBenchmarkCode | null
  calculationVersion: FiqhCalculationSnapshot["calculationVersion"] | null
  netZakatableBase: FiqhCalculationSnapshot["netZakatableBase"] | null
  isAboveNisab: FiqhCalculationSnapshot["isAboveNisab"] | null
  isZakatDue: FiqhCalculationSnapshot["isZakatDue"] | null
  fiqhExplanation: FiqhCalculationExplanation | null
}

export type ReplaceWealthSnapshotInput = {
  profileId: string
  entries: WealthSnapshotEntryInput[]
  snapshot: WealthSnapshotWriteContext
  capturedAt?: Date
}

type WealthSnapshotDbRecord = {
  id: string
  profileId: string
  capturedAt: Date
  madhab: string | null
  nisabBenchmark: string | null
  calculationVersion: string | null
  netZakatableBase: string | null
  isAboveNisab: boolean | null
  isZakatDue: boolean | null
  fiqhExplanation: string | null
  createdAt: Date
  updatedAt: Date
}

function parseFiqhExplanation(
  value: string | null,
): FiqhCalculationExplanation | null {
  if (!value) {
    return null
  }

  try {
    return JSON.parse(value) as FiqhCalculationExplanation
  } catch {
    return null
  }
}

function toWealthSnapshotRecord(
  record: WealthSnapshotDbRecord,
): WealthSnapshotRecord {
  return {
    ...record,
    madhab: record.madhab as FiqhMadhabCode | null,
    nisabBenchmark: record.nisabBenchmark as FiqhNisabBenchmarkCode | null,
    fiqhExplanation: parseFiqhExplanation(record.fiqhExplanation),
  }
}

export async function getWealthSnapshotRecordByProfileId(
  profileId: string,
) {
  const [record] = (await db
    .select({
      id: wealthSnapshot.id,
      profileId: wealthSnapshot.profileId,
      capturedAt: wealthSnapshot.capturedAt,
      madhab: wealthSnapshot.madhab,
      nisabBenchmark: wealthSnapshot.nisabBenchmark,
      calculationVersion: wealthSnapshot.calculationVersion,
      netZakatableBase: wealthSnapshot.netZakatableBase,
      isAboveNisab: wealthSnapshot.isAboveNisab,
      isZakatDue: wealthSnapshot.isZakatDue,
      fiqhExplanation: wealthSnapshot.fiqhExplanation,
      createdAt: wealthSnapshot.createdAt,
      updatedAt: wealthSnapshot.updatedAt,
    })
    .from(wealthSnapshot)
    .where(eq(wealthSnapshot.profileId, profileId))
    .orderBy(desc(wealthSnapshot.capturedAt), desc(wealthSnapshot.id))
    .limit(1)) as WealthSnapshotDbRecord[]

  return record ? toWealthSnapshotRecord(record) : null
}

export async function getWealthSnapshotWithEntriesRecordByProfileId(
  profileId: string,
) {
  const snapshot = await getWealthSnapshotRecordByProfileId(profileId)

  if (!snapshot) {
    return null
  }

  const entries = await db
    .select({
      id: wealthSnapshotEntry.id,
      snapshotId: wealthSnapshotEntry.snapshotId,
      category: wealthSnapshotEntry.category,
      amount: wealthSnapshotEntry.amount,
      createdAt: wealthSnapshotEntry.createdAt,
      updatedAt: wealthSnapshotEntry.updatedAt,
    })
    .from(wealthSnapshotEntry)
    .where(eq(wealthSnapshotEntry.snapshotId, snapshot.id))
    .orderBy(asc(wealthSnapshotEntry.category))

  return {
    ...snapshot,
    entries,
  }
}

export async function listWealthSnapshotRecordsByProfileId(
  profileId: string,
  limit = 10,
) {
  const rows = (await db
    .select({
      id: wealthSnapshot.id,
      profileId: wealthSnapshot.profileId,
      capturedAt: wealthSnapshot.capturedAt,
      madhab: wealthSnapshot.madhab,
      nisabBenchmark: wealthSnapshot.nisabBenchmark,
      calculationVersion: wealthSnapshot.calculationVersion,
      netZakatableBase: wealthSnapshot.netZakatableBase,
      isAboveNisab: wealthSnapshot.isAboveNisab,
      isZakatDue: wealthSnapshot.isZakatDue,
      fiqhExplanation: wealthSnapshot.fiqhExplanation,
      createdAt: wealthSnapshot.createdAt,
      updatedAt: wealthSnapshot.updatedAt,
    })
    .from(wealthSnapshot)
    .where(eq(wealthSnapshot.profileId, profileId))
    .orderBy(desc(wealthSnapshot.capturedAt), desc(wealthSnapshot.id))
    .limit(limit)) as WealthSnapshotDbRecord[]

  return rows.map(toWealthSnapshotRecord)
}

export async function listWealthSnapshotHistoryRecordsByProfileId(
  profileId: string,
  input: ListWealthSnapshotHistoryInput,
): Promise<WealthSnapshotHistoryPage> {
  const snapshots = (await db
    .select({
      id: wealthSnapshot.id,
      profileId: wealthSnapshot.profileId,
      capturedAt: wealthSnapshot.capturedAt,
      madhab: wealthSnapshot.madhab,
      nisabBenchmark: wealthSnapshot.nisabBenchmark,
      calculationVersion: wealthSnapshot.calculationVersion,
      netZakatableBase: wealthSnapshot.netZakatableBase,
      isAboveNisab: wealthSnapshot.isAboveNisab,
      isZakatDue: wealthSnapshot.isZakatDue,
      fiqhExplanation: wealthSnapshot.fiqhExplanation,
      createdAt: wealthSnapshot.createdAt,
      updatedAt: wealthSnapshot.updatedAt,
    })
    .from(wealthSnapshot)
    .where(eq(wealthSnapshot.profileId, profileId))
    .orderBy(desc(wealthSnapshot.capturedAt), desc(wealthSnapshot.id))
    .limit(input.pageSize + 1)
    .offset((input.page - 1) * input.pageSize)) as WealthSnapshotDbRecord[]

  const hasMore = snapshots.length > input.pageSize
  const pageSnapshots = hasMore ? snapshots.slice(0, input.pageSize) : snapshots

  if (pageSnapshots.length === 0) {
    return {
      items: [],
      page: input.page,
      pageSize: input.pageSize,
      hasMore,
    }
  }

  const snapshotIds = pageSnapshots.map((snapshot) => snapshot.id)
  const entries = await db
    .select({
      id: wealthSnapshotEntry.id,
      snapshotId: wealthSnapshotEntry.snapshotId,
      category: wealthSnapshotEntry.category,
      amount: wealthSnapshotEntry.amount,
      createdAt: wealthSnapshotEntry.createdAt,
      updatedAt: wealthSnapshotEntry.updatedAt,
    })
    .from(wealthSnapshotEntry)
    .where(inArray(wealthSnapshotEntry.snapshotId, snapshotIds))
    .orderBy(
      desc(wealthSnapshotEntry.snapshotId),
      asc(wealthSnapshotEntry.category),
    )

  const entriesBySnapshotId = new Map<string, WealthSnapshotEntryRecord[]>()

  for (const snapshotId of snapshotIds) {
    entriesBySnapshotId.set(snapshotId, [])
  }

  for (const entry of entries) {
    const groupedEntries = entriesBySnapshotId.get(entry.snapshotId)
    if (groupedEntries) {
      groupedEntries.push(entry)
    }
  }

  return {
    items: pageSnapshots.map((snapshot) => ({
      ...toWealthSnapshotRecord(snapshot),
      entries: entriesBySnapshotId.get(snapshot.id) ?? [],
    })),
    page: input.page,
    pageSize: input.pageSize,
    hasMore,
  }
}

export async function replaceWealthSnapshotRecord(
  input: ReplaceWealthSnapshotInput,
  database: DatabaseLike = db,
): Promise<WealthSnapshotWithEntriesRecord | null> {
  const capturedAt = input.capturedAt ?? new Date()

  const [snapshotRecord] = (await database
    .insert(wealthSnapshot)
    .values({
      id: crypto.randomUUID(),
      profileId: input.profileId,
      capturedAt,
      madhab: input.snapshot.madhab,
      nisabBenchmark: input.snapshot.nisabBenchmark,
      calculationVersion: input.snapshot.calculationVersion,
      netZakatableBase: input.snapshot.netZakatableBase,
      isAboveNisab: input.snapshot.isAboveNisab,
      isZakatDue: input.snapshot.isZakatDue,
      fiqhExplanation: input.snapshot.fiqhExplanation
        ? JSON.stringify(input.snapshot.fiqhExplanation)
        : null,
    })
    .returning({
      id: wealthSnapshot.id,
      profileId: wealthSnapshot.profileId,
      capturedAt: wealthSnapshot.capturedAt,
      madhab: wealthSnapshot.madhab,
      nisabBenchmark: wealthSnapshot.nisabBenchmark,
      calculationVersion: wealthSnapshot.calculationVersion,
      netZakatableBase: wealthSnapshot.netZakatableBase,
      isAboveNisab: wealthSnapshot.isAboveNisab,
      isZakatDue: wealthSnapshot.isZakatDue,
      fiqhExplanation: wealthSnapshot.fiqhExplanation,
      createdAt: wealthSnapshot.createdAt,
      updatedAt: wealthSnapshot.updatedAt,
    })) as WealthSnapshotDbRecord[]

  if (!snapshotRecord) {
    return null
  }

  try {
    if (input.entries.length > 0) {
      await database.insert(wealthSnapshotEntry).values(
        input.entries.map((entry) => ({
          id: crypto.randomUUID(),
          snapshotId: snapshotRecord.id,
          category: entry.category,
          amount: entry.amount,
        })),
      )
    }

    const entries = await database
      .select({
        id: wealthSnapshotEntry.id,
        snapshotId: wealthSnapshotEntry.snapshotId,
        category: wealthSnapshotEntry.category,
        amount: wealthSnapshotEntry.amount,
        createdAt: wealthSnapshotEntry.createdAt,
        updatedAt: wealthSnapshotEntry.updatedAt,
      })
      .from(wealthSnapshotEntry)
      .where(eq(wealthSnapshotEntry.snapshotId, snapshotRecord.id))
      .orderBy(asc(wealthSnapshotEntry.category))

    return {
      ...toWealthSnapshotRecord(snapshotRecord),
      entries,
    }
  } catch (error) {
    await database.delete(wealthSnapshot).where(eq(wealthSnapshot.id, snapshotRecord.id))

    throw error
  }
}
