import { and, desc, eq, inArray, isNull, ne, or } from "drizzle-orm"

import { db } from "@/server/db/client"
import {
  notificationDeliveryAttempt,
  reminderJob,
  wealthSnapshot,
  zakatCycle,
} from "@/server/db/schema"
import type {
  FiqhCalculationExplanation,
  FiqhCycleState,
  FiqhMadhabCode,
  FiqhNisabBenchmarkCode,
  FiqhCalculationSnapshot,
} from "@/features/fiqh-calculation"
import type {
  NotificationChannel,
  NotificationDeliveryAttemptStatus,
} from "@/features/notifications"
import type {
  ReminderJobKind,
  ReminderJobPhase,
  ReminderJobStatus,
} from "@/features/reminders"

import type {
  HistoryCycleHistoryPage,
  HistoryCycleRecord,
  HistoryReminderDeliveryAttempt,
  HistoryReminderJob,
  HistorySourceSnapshotSummary,
} from "../../lib/history.types"
import type { ListHistoryCyclesInput } from "../schemas/history.schema"

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

type HistoryReminderJobDbRecord = {
  id: string
  profileId: string
  dedupeKey: string
  kind: ReminderJobKind
  zakatCycleId: string | null
  phase: ReminderJobPhase | null
  scheduledFor: Date
  status: ReminderJobStatus
  attemptCount: number
  claimedAt: Date | null
  completedAt: Date | null
  lastAttemptAt: Date | null
  lastError: string | null
  createdAt: Date
  updatedAt: Date
}

type HistoryDeliveryAttemptDbRecord = {
  id: string
  reminderJobId: string
  subscriptionId: string
  channel: NotificationChannel
  kind: ReminderJobKind
  status: NotificationDeliveryAttemptStatus
  attemptedAt: Date
  deliveredAt: Date | null
  errorMessage: string | null
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

function toHistoryDeliveryAttemptRecord(
  record: HistoryDeliveryAttemptDbRecord,
): HistoryReminderDeliveryAttempt {
  return {
    id: record.id,
    reminderJobId: record.reminderJobId,
    subscriptionId: record.subscriptionId,
    channel: record.channel,
    kind: record.kind,
    status: record.status,
    attemptedAt: record.attemptedAt,
    deliveredAt: record.deliveredAt,
    errorMessage: record.errorMessage,
  }
}

function toHistoryReminderJobRecord(
  record: HistoryReminderJobDbRecord,
  deliveryAttempts: HistoryReminderDeliveryAttempt[],
): HistoryReminderJob {
  const base = {
    id: record.id,
    profileId: record.profileId,
    dedupeKey: record.dedupeKey,
    scheduledFor: record.scheduledFor,
    status: record.status,
    attemptCount: record.attemptCount,
    claimedAt: record.claimedAt,
    completedAt: record.completedAt,
    lastAttemptAt: record.lastAttemptAt,
    lastError: record.lastError,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
    deliveryAttempts,
  }

  if (record.kind === "balance_update") {
    return {
      ...base,
      kind: "balance_update",
      zakatCycleId: null,
      phase: null,
    }
  }

  return {
    ...base,
    kind: "zakat_due",
    zakatCycleId: record.zakatCycleId ?? "",
    phase: record.phase ?? "due",
  }
}

function toHistoryCycleRecord(
  record: HistoryCycleDbRecord,
  sourceSnapshot: HistorySourceSnapshotSummary | null,
  reminderJobs: HistoryReminderJob[],
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
    reminderJobs,
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

  const cycleIds = pageCycles.map((cycle) => cycle.id)
  const reminderJobs = cycleIds.length
    ? ((await db
        .select({
          id: reminderJob.id,
          profileId: reminderJob.profileId,
          dedupeKey: reminderJob.dedupeKey,
          kind: reminderJob.kind,
          zakatCycleId: reminderJob.zakatCycleId,
          phase: reminderJob.phase,
          scheduledFor: reminderJob.scheduledFor,
          status: reminderJob.status,
          attemptCount: reminderJob.attemptCount,
          claimedAt: reminderJob.claimedAt,
          completedAt: reminderJob.completedAt,
          lastAttemptAt: reminderJob.lastAttemptAt,
          lastError: reminderJob.lastError,
          createdAt: reminderJob.createdAt,
          updatedAt: reminderJob.updatedAt,
        })
        .from(reminderJob)
        .where(inArray(reminderJob.zakatCycleId, cycleIds))
        .orderBy(
          desc(reminderJob.scheduledFor),
          desc(reminderJob.createdAt),
          desc(reminderJob.id),
        )) as HistoryReminderJobDbRecord[])
    : []

  const reminderJobIds = reminderJobs.map((job) => job.id)
  const deliveryAttempts = reminderJobIds.length
    ? ((await db
        .select({
          id: notificationDeliveryAttempt.id,
          reminderJobId: notificationDeliveryAttempt.reminderJobId,
          subscriptionId: notificationDeliveryAttempt.subscriptionId,
          channel: notificationDeliveryAttempt.channel,
          kind: notificationDeliveryAttempt.kind,
          status: notificationDeliveryAttempt.status,
          attemptedAt: notificationDeliveryAttempt.attemptedAt,
          deliveredAt: notificationDeliveryAttempt.deliveredAt,
          errorMessage: notificationDeliveryAttempt.errorMessage,
        })
        .from(notificationDeliveryAttempt)
        .where(inArray(notificationDeliveryAttempt.reminderJobId, reminderJobIds))
        .orderBy(
          desc(notificationDeliveryAttempt.attemptedAt),
          desc(notificationDeliveryAttempt.id),
        )) as HistoryDeliveryAttemptDbRecord[])
    : []

  const deliveryAttemptsByReminderJobId = new Map<
    string,
    HistoryReminderDeliveryAttempt[]
  >()

  for (const reminderJobId of reminderJobIds) {
    deliveryAttemptsByReminderJobId.set(reminderJobId, [])
  }

  for (const deliveryAttempt of deliveryAttempts) {
    const groupedAttempts = deliveryAttemptsByReminderJobId.get(
      deliveryAttempt.reminderJobId,
    )

    if (groupedAttempts) {
      groupedAttempts.push(toHistoryDeliveryAttemptRecord(deliveryAttempt))
    }
  }

  const reminderJobsByCycleId = new Map<string, HistoryReminderJob[]>()

  for (const cycleId of cycleIds) {
    reminderJobsByCycleId.set(cycleId, [])
  }

  for (const reminderJobRecord of reminderJobs) {
    const groupedJobs = reminderJobsByCycleId.get(reminderJobRecord.zakatCycleId ?? "")

    if (groupedJobs) {
      groupedJobs.push(
        toHistoryReminderJobRecord(
          reminderJobRecord,
          deliveryAttemptsByReminderJobId.get(reminderJobRecord.id) ?? [],
        ),
      )
    }
  }

  return {
    items: pageCycles.map((cycle) =>
      toHistoryCycleRecord(
        cycle,
        cycle.sourceSnapshotId
          ? sourceSnapshotsById.get(cycle.sourceSnapshotId) ?? null
          : null,
        reminderJobsByCycleId.get(cycle.id) ?? [],
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
): Promise<HistoryCycleRecord | null> {
  const updatedRows = (await db
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
    return toHistoryCycleRecord(updated, null, [])
  }

  const [existing] = (await db
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

  return existing ? toHistoryCycleRecord(existing, null, []) : null
}
