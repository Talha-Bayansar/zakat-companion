import { asc, desc, eq, inArray } from "drizzle-orm"

import { db } from "@/server/db/client"
import { wealthSnapshot, wealthSnapshotEntry } from "@/server/db/schema"
import type { InfiniteListPage } from "@/shared/lib/infinite-list"

import type {
  ListWealthSnapshotHistoryInput,
  ReplaceWealthSnapshotInput,
  WealthCategory,
} from "../schemas/wealth-snapshot.schema"

export type WealthSnapshotRecord = {
  id: string
  profileId: string
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

export async function getWealthSnapshotRecordByProfileId(profileId: string) {
  const [record] = await db
    .select({
      id: wealthSnapshot.id,
      profileId: wealthSnapshot.profileId,
      createdAt: wealthSnapshot.createdAt,
      updatedAt: wealthSnapshot.updatedAt,
    })
    .from(wealthSnapshot)
    .where(eq(wealthSnapshot.profileId, profileId))
    .orderBy(desc(wealthSnapshot.createdAt), desc(wealthSnapshot.id))
    .limit(1)

  return record ?? null
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
  return db
    .select({
      id: wealthSnapshot.id,
      profileId: wealthSnapshot.profileId,
      createdAt: wealthSnapshot.createdAt,
      updatedAt: wealthSnapshot.updatedAt,
    })
    .from(wealthSnapshot)
    .where(eq(wealthSnapshot.profileId, profileId))
    .orderBy(desc(wealthSnapshot.createdAt), desc(wealthSnapshot.id))
    .limit(limit)
}

export async function listWealthSnapshotHistoryRecordsByProfileId(
  profileId: string,
  input: ListWealthSnapshotHistoryInput,
): Promise<WealthSnapshotHistoryPage> {
  const snapshots = await db
    .select({
      id: wealthSnapshot.id,
      profileId: wealthSnapshot.profileId,
      createdAt: wealthSnapshot.createdAt,
      updatedAt: wealthSnapshot.updatedAt,
    })
    .from(wealthSnapshot)
    .where(eq(wealthSnapshot.profileId, profileId))
    .orderBy(desc(wealthSnapshot.createdAt), desc(wealthSnapshot.id))
    .limit(input.pageSize + 1)
    .offset((input.page - 1) * input.pageSize)

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
      ...snapshot,
      entries: entriesBySnapshotId.get(snapshot.id) ?? [],
    })),
    page: input.page,
    pageSize: input.pageSize,
    hasMore,
  }
}

export async function replaceWealthSnapshotRecord(
  input: ReplaceWealthSnapshotInput,
): Promise<WealthSnapshotWithEntriesRecord | null> {
  const [snapshotRecord] = await db
    .insert(wealthSnapshot)
    .values({
      id: crypto.randomUUID(),
      profileId: input.profileId,
    })
    .returning({
      id: wealthSnapshot.id,
      profileId: wealthSnapshot.profileId,
      createdAt: wealthSnapshot.createdAt,
      updatedAt: wealthSnapshot.updatedAt,
    })

  if (!snapshotRecord) {
    return null
  }

  try {
    if (input.entries.length > 0) {
      await db.insert(wealthSnapshotEntry).values(
        input.entries.map((entry) => ({
          id: crypto.randomUUID(),
          snapshotId: snapshotRecord.id,
          category: entry.category,
          amount: entry.amount,
        })),
      )
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
      .where(eq(wealthSnapshotEntry.snapshotId, snapshotRecord.id))
      .orderBy(asc(wealthSnapshotEntry.category))

    return {
      ...snapshotRecord,
      entries,
    }
  } catch (error) {
    await db
      .delete(wealthSnapshot)
      .where(eq(wealthSnapshot.id, snapshotRecord.id))

    throw error
  }
}
