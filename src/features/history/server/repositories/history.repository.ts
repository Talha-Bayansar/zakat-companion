import { and, desc, eq, inArray, isNull, ne, or } from "drizzle-orm"

import { db, type Database } from "@/server/db/client"
import { wealthSnapshot, zakatCycle } from "@/server/db/schema"
import type {
  FiqhCalculationExplanation,
  FiqhCycleState,
  FiqhMadhabCode,
  FiqhNisabBenchmarkCode,
  FiqhCalculationSnapshot,
} from "@/features/fiqh-calculation"

import type {
  HistoryCycleHistoryPage,
  HistoryCycleRecord,
  HistorySourceSnapshotSummary,
} from "../../lib/history.types"
import type { ListHistoryCyclesInput } from "../schemas/history.schema"

type DatabaseLike = Pick<
  Database,
  "select" | "insert" | "update" | "delete"
>

type HistoryCycleDbRecord = {
  id: string
  profileId: string
  sourceSnapshotId: string | null
  state: FiqhCycleState
  dueAt: Date
  paidAt: Date | null
  createdAt: Date
  updatedAt: Date
}

type HistorySourceSnapshotDbRecord = {
  id: string
  capturedAt: Date
  madhab: FiqhMadhabCode | null
  nisabBenchmark: FiqhNisabBenchmarkCode | null
  calculationVersion: FiqhCalculationSnapshot["calculationVersion"] | null
  netZakatableBase: FiqhCalculationSnapshot["netZakatableBase"] | null
  isAboveNisab: FiqhCalculationSnapshot["isAboveNisab"] | null
  isZakatDue: FiqhCalculationSnapshot["isZakatDue"] | null
  fiqhExplanation: string | null
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

function toHistorySourceSnapshotSummaryRecord(
  record: HistorySourceSnapshotDbRecord,
): HistorySourceSnapshotSummary {
  return {
    id: record.id,
    capturedAt: record.capturedAt,
    madhab: record.madhab,
    nisabBenchmark: record.nisabBenchmark,
    calculationVersion: record.calculationVersion,
    netZakatableBase: record.netZakatableBase,
    isAboveNisab: record.isAboveNisab,
    isZakatDue: record.isZakatDue,
    fiqhExplanation: parseFiqhExplanation(record.fiqhExplanation),
  }
}

function toHistoryCycleRecord(
  record: HistoryCycleDbRecord,
  sourceSnapshot: HistorySourceSnapshotSummary | null,
): HistoryCycleRecord {
  return {
    id: record.id,
    profileId: record.profileId,
    sourceSnapshotId: record.sourceSnapshotId,
    state: record.state,
    dueAt: record.dueAt,
    paidAt: record.paidAt,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
    sourceSnapshot,
  }
}

export async function listHistoryCycleRecordsByProfileId(
  profileId: string,
  input: ListHistoryCyclesInput,
): Promise<HistoryCycleHistoryPage> {
  const cycleRows = (await db
    .select({
      id: zakatCycle.id,
      profileId: zakatCycle.profileId,
      sourceSnapshotId: zakatCycle.sourceSnapshotId,
      state: zakatCycle.state,
      dueAt: zakatCycle.dueAt,
      paidAt: zakatCycle.paidAt,
      createdAt: zakatCycle.createdAt,
      updatedAt: zakatCycle.updatedAt,
    })
    .from(zakatCycle)
    .where(eq(zakatCycle.profileId, profileId))
    .orderBy(desc(zakatCycle.dueAt), desc(zakatCycle.createdAt), desc(zakatCycle.id))
    .limit(input.pageSize + 1)
    .offset((input.page - 1) * input.pageSize)) as HistoryCycleDbRecord[]

  const hasMore = cycleRows.length > input.pageSize
  const pageCycles = hasMore ? cycleRows.slice(0, input.pageSize) : cycleRows

  if (pageCycles.length === 0) {
    return {
      items: [],
      page: input.page,
      pageSize: input.pageSize,
      hasMore,
    }
  }

  const sourceSnapshotIds = pageCycles
    .map((cycle) => cycle.sourceSnapshotId)
    .filter((sourceSnapshotId): sourceSnapshotId is string => sourceSnapshotId !== null)

  const sourceSnapshots = sourceSnapshotIds.length
    ? ((await db
        .select({
          id: wealthSnapshot.id,
          capturedAt: wealthSnapshot.capturedAt,
          madhab: wealthSnapshot.madhab,
          nisabBenchmark: wealthSnapshot.nisabBenchmark,
          calculationVersion: wealthSnapshot.calculationVersion,
          netZakatableBase: wealthSnapshot.netZakatableBase,
          isAboveNisab: wealthSnapshot.isAboveNisab,
          isZakatDue: wealthSnapshot.isZakatDue,
          fiqhExplanation: wealthSnapshot.fiqhExplanation,
        })
        .from(wealthSnapshot)
        .where(inArray(wealthSnapshot.id, sourceSnapshotIds))) as HistorySourceSnapshotDbRecord[])
    : []

  const sourceSnapshotsById = new Map(
    sourceSnapshots.map((snapshot) => [
      snapshot.id,
      toHistorySourceSnapshotSummaryRecord(snapshot),
    ]),
  )

  return {
    items: pageCycles.map((cycle) =>
      toHistoryCycleRecord(
        cycle,
        cycle.sourceSnapshotId
          ? sourceSnapshotsById.get(cycle.sourceSnapshotId) ?? null
          : null,
      ),
    ),
    page: input.page,
    pageSize: input.pageSize,
    hasMore,
  }
}

export async function markHistoryCyclePaidRecord(
  profileId: string,
  zakatCycleId: string,
  paidAt = new Date(),
  database: DatabaseLike = db,
): Promise<HistoryCycleRecord | null> {
  const updatedRows = (await database
    .update(zakatCycle)
    .set({
      state: "paid",
      paidAt,
      updatedAt: paidAt,
    })
    .where(
      and(
        eq(zakatCycle.id, zakatCycleId),
        eq(zakatCycle.profileId, profileId),
        or(ne(zakatCycle.state, "paid"), isNull(zakatCycle.paidAt)),
      ),
    )
    .returning({
      id: zakatCycle.id,
      profileId: zakatCycle.profileId,
      sourceSnapshotId: zakatCycle.sourceSnapshotId,
      state: zakatCycle.state,
      dueAt: zakatCycle.dueAt,
      paidAt: zakatCycle.paidAt,
      createdAt: zakatCycle.createdAt,
      updatedAt: zakatCycle.updatedAt,
    })) as HistoryCycleDbRecord[]

  const updated = updatedRows[0]

  if (updated) {
    return toHistoryCycleRecord(updated, null)
  }

  const [existing] = (await database
    .select({
      id: zakatCycle.id,
      profileId: zakatCycle.profileId,
      sourceSnapshotId: zakatCycle.sourceSnapshotId,
      state: zakatCycle.state,
      dueAt: zakatCycle.dueAt,
      paidAt: zakatCycle.paidAt,
      createdAt: zakatCycle.createdAt,
      updatedAt: zakatCycle.updatedAt,
    })
    .from(zakatCycle)
    .where(
      and(
        eq(zakatCycle.id, zakatCycleId),
        eq(zakatCycle.profileId, profileId),
      ),
    )
    .limit(1)) as HistoryCycleDbRecord[]

  return existing ? toHistoryCycleRecord(existing, null) : null
}
