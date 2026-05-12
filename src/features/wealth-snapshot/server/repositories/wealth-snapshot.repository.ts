import { asc, eq } from "drizzle-orm"

import { db } from "@/server/db/client"
import { wealthSnapshot, wealthSnapshotEntry } from "@/server/db/schema"

import type {
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

export async function replaceWealthSnapshotRecord(
  input: ReplaceWealthSnapshotInput,
): Promise<WealthSnapshotWithEntriesRecord | null> {
  const result = await db.transaction(async (tx) => {
    const [existingSnapshot] = await tx
      .select({
        id: wealthSnapshot.id,
        profileId: wealthSnapshot.profileId,
        createdAt: wealthSnapshot.createdAt,
        updatedAt: wealthSnapshot.updatedAt,
      })
      .from(wealthSnapshot)
      .where(eq(wealthSnapshot.profileId, input.profileId))
      .limit(1)

    const snapshotRecord =
      existingSnapshot ??
      (await tx
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
        .then((records) => records[0] ?? null))

    if (!snapshotRecord) {
      return null
    }

    await tx
      .delete(wealthSnapshotEntry)
      .where(eq(wealthSnapshotEntry.snapshotId, snapshotRecord.id))

    if (input.entries.length > 0) {
      await tx.insert(wealthSnapshotEntry).values(
        input.entries.map((entry) => ({
          id: crypto.randomUUID(),
          snapshotId: snapshotRecord.id,
          category: entry.category,
          amount: entry.amount,
        })),
      )
    }

    const [updatedSnapshot] = await tx
      .update(wealthSnapshot)
      .set({
        updatedAt: new Date(),
      })
      .where(eq(wealthSnapshot.id, snapshotRecord.id))
      .returning({
        id: wealthSnapshot.id,
        profileId: wealthSnapshot.profileId,
        createdAt: wealthSnapshot.createdAt,
        updatedAt: wealthSnapshot.updatedAt,
      })

    const entries = await tx
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
      ...(updatedSnapshot ?? snapshotRecord),
      entries,
    }
  })

  return result
}
