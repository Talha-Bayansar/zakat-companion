import { and, eq, gt, isNotNull, lte, or, sql } from "drizzle-orm"

import { db, type Database } from "@/server/db/client"
import {
  reminderJob,
  reminderPreference,
  zakatCycle,
} from "@/server/db/schema"
import {
  type BalanceUpdateReminderJobRecord,
  type ReminderPreference,
  type ReminderPreferenceRecord,
  type ReminderJobRecord,
  type ZakatCycleRecord,
  type ZakatDueReminderJobRecord,
} from "../../lib/reminders.types"
import {
  reminderJobClaimLeaseMs,
  type ReminderJobPhase,
} from "../../lib/reminders.constants"

type DatabaseLike = Pick<
  Database,
  "select" | "insert" | "update" | "delete"
>

function toReminderPreferenceRecord(
  record: typeof reminderPreference.$inferSelect,
): ReminderPreferenceRecord {
  return {
    profileId: record.profileId,
    balanceUpdateCadence: record.balanceUpdateCadence,
    timezone: record.timezone,
    quietHours:
      record.quietHoursStartTime && record.quietHoursEndTime
      ? {
          startTime: record.quietHoursStartTime,
          endTime: record.quietHoursEndTime,
        }
      : null,
    zakatDueFollowUpEnabled: record.zakatDueFollowUpEnabled,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
  }
}

function toZakatCycleRecord(
  record: typeof zakatCycle.$inferSelect,
): ZakatCycleRecord {
  return {
    id: record.id,
    profileId: record.profileId,
    sourceSnapshotId: record.sourceSnapshotId,
    state: record.state,
    dueAt: record.dueAt,
    paidAt: record.paidAt,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
  }
}

function toReminderJobRecord(
  record: typeof reminderJob.$inferSelect,
): ReminderJobRecord {
  if (record.kind === "balance_update") {
    return {
      id: record.id,
      profileId: record.profileId,
      dedupeKey: record.dedupeKey,
      kind: record.kind,
      zakatCycleId: null,
      phase: null,
      scheduledFor: record.scheduledFor,
      status: record.status,
      attemptCount: record.attemptCount,
      claimedAt: record.claimedAt,
      completedAt: record.completedAt,
      lastAttemptAt: record.lastAttemptAt,
      lastError: record.lastError,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    } satisfies BalanceUpdateReminderJobRecord
  }

  return {
    id: record.id,
    profileId: record.profileId,
    dedupeKey: record.dedupeKey,
    kind: record.kind,
    zakatCycleId: record.zakatCycleId ?? "",
    phase: record.phase as ReminderJobPhase,
    scheduledFor: record.scheduledFor,
    status: record.status,
    attemptCount: record.attemptCount,
    claimedAt: record.claimedAt,
    completedAt: record.completedAt,
    lastAttemptAt: record.lastAttemptAt,
    lastError: record.lastError,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
  } satisfies ZakatDueReminderJobRecord
}

function createBalanceUpdateDedupeKey(
  profileId: string,
  sourceSnapshotId: string | null,
  scheduledFor: Date,
) {
  return sourceSnapshotId
    ? `balance_update:${profileId}:${sourceSnapshotId}`
    : `balance_update:${profileId}:${scheduledFor.toISOString()}`
}

function createZakatDueDedupeKey(
  profileId: string,
  zakatCycleId: string,
  phase: ReminderJobPhase,
) {
  return `zakat_due:${profileId}:${zakatCycleId}:${phase}`
}

function getDefaultReminderTimezone() {
  return Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC"
}

export function createDefaultReminderPreferenceInput(): ReminderPreference {
  return {
    balanceUpdateCadence: "monthly",
    timezone: getDefaultReminderTimezone(),
    quietHours: null,
    zakatDueFollowUpEnabled: true,
  }
}

export async function getReminderPreferenceRecordByProfileId(
  profileId: string,
  database: DatabaseLike = db,
) {
  const [record] = await database
    .select()
    .from(reminderPreference)
    .where(eq(reminderPreference.profileId, profileId))
    .limit(1)

  return record ? toReminderPreferenceRecord(record) : null
}

export async function createDefaultReminderPreferenceRecord(
  profileId: string,
  database: DatabaseLike = db,
) {
  return upsertReminderPreferenceRecord(
    profileId,
    createDefaultReminderPreferenceInput(),
    database,
  )
}

export async function upsertReminderPreferenceRecord(
  profileId: string,
  input: ReminderPreference,
  database: DatabaseLike = db,
) {
  const [record] = await database
    .insert(reminderPreference)
    .values({
      id: crypto.randomUUID(),
      profileId,
      balanceUpdateCadence: input.balanceUpdateCadence,
      timezone: input.timezone,
      quietHoursStartTime: input.quietHours?.startTime ?? null,
      quietHoursEndTime: input.quietHours?.endTime ?? null,
      zakatDueFollowUpEnabled: input.zakatDueFollowUpEnabled,
    })
    .onConflictDoUpdate({
      target: reminderPreference.profileId,
      set: {
        balanceUpdateCadence: input.balanceUpdateCadence,
        timezone: input.timezone,
        quietHoursStartTime: input.quietHours?.startTime ?? null,
        quietHoursEndTime: input.quietHours?.endTime ?? null,
        zakatDueFollowUpEnabled: input.zakatDueFollowUpEnabled,
        updatedAt: new Date(),
      },
    })
    .returning()

  return toReminderPreferenceRecord(record)
}

export async function getZakatCycleRecordById(zakatCycleId: string) {
  const [record] = await db
    .select()
    .from(zakatCycle)
    .where(eq(zakatCycle.id, zakatCycleId))
    .limit(1)

  return record ? toZakatCycleRecord(record) : null
}

export async function createZakatCycleRecord(input: {
  profileId: string
  sourceSnapshotId?: string | null
  state: ZakatCycleRecord["state"]
  dueAt: Date
  paidAt?: Date | null
}, database: DatabaseLike = db) {
  const [record] = await database
    .insert(zakatCycle)
    .values({
      id: crypto.randomUUID(),
      profileId: input.profileId,
      sourceSnapshotId: input.sourceSnapshotId ?? null,
      state: input.state,
      dueAt: input.dueAt,
      paidAt: input.paidAt ?? null,
    })
    .returning()

  return toZakatCycleRecord(record)
}

export async function createBalanceUpdateReminderJobRecord(input: {
  profileId: string
  scheduledFor: Date
  sourceSnapshotId?: string | null
}, database: DatabaseLike = db) {
  const dedupeKey = createBalanceUpdateDedupeKey(
    input.profileId,
    input.sourceSnapshotId ?? null,
    input.scheduledFor,
  )

  const [record] = await database
    .insert(reminderJob)
    .values({
      id: crypto.randomUUID(),
      profileId: input.profileId,
      dedupeKey,
      kind: "balance_update",
      zakatCycleId: null,
      phase: null,
      status: "pending",
      scheduledFor: input.scheduledFor,
      attemptCount: 0,
      claimedAt: null,
      completedAt: null,
      lastAttemptAt: null,
      lastError: null,
    })
    .onConflictDoUpdate({
      target: reminderJob.dedupeKey,
      set: {
        profileId: input.profileId,
        zakatCycleId: null,
        kind: "balance_update",
        phase: null,
        status: "pending",
        scheduledFor: input.scheduledFor,
        attemptCount: 0,
        claimedAt: null,
        completedAt: null,
        lastAttemptAt: null,
        lastError: null,
        updatedAt: new Date(),
      },
    })
    .returning()

  return toReminderJobRecord(record)
}

export async function createZakatDueReminderJobRecord(input: {
  profileId: string
  zakatCycleId: string
  phase: ReminderJobPhase
  scheduledFor: Date
}, database: DatabaseLike = db) {
  const dedupeKey = createZakatDueDedupeKey(
    input.profileId,
    input.zakatCycleId,
    input.phase,
  )

  const [record] = await database
    .insert(reminderJob)
    .values({
      id: crypto.randomUUID(),
      profileId: input.profileId,
      zakatCycleId: input.zakatCycleId,
      dedupeKey,
      kind: "zakat_due",
      phase: input.phase,
      status: "pending",
      scheduledFor: input.scheduledFor,
      attemptCount: 0,
      claimedAt: null,
      completedAt: null,
      lastAttemptAt: null,
      lastError: null,
    })
    .onConflictDoUpdate({
      target: reminderJob.dedupeKey,
      set: {
        profileId: input.profileId,
        zakatCycleId: input.zakatCycleId,
        kind: "zakat_due",
        phase: input.phase,
        status: "pending",
        scheduledFor: input.scheduledFor,
        attemptCount: 0,
        claimedAt: null,
        completedAt: null,
        lastAttemptAt: null,
        lastError: null,
        updatedAt: new Date(),
      },
    })
    .returning()

  return toReminderJobRecord(record)
}

export async function suppressFutureZakatDueReminderJobRecords(
  input: {
    profileId: string
    zakatCycleId: string
    paidAt: Date
  },
  database: DatabaseLike = db,
) {
  const rows = await database
    .update(reminderJob)
    .set({
      status: "suppressed",
      updatedAt: input.paidAt,
    })
    .where(
      and(
        eq(reminderJob.profileId, input.profileId),
        eq(reminderJob.zakatCycleId, input.zakatCycleId),
        eq(reminderJob.kind, "zakat_due"),
        eq(reminderJob.status, "pending"),
        gt(reminderJob.scheduledFor, input.paidAt),
      ),
    )
    .returning()

  return rows.map(toReminderJobRecord)
}

export async function claimDueReminderJobRecords(
  now = new Date(),
  staleClaimBefore = new Date(now.getTime() - reminderJobClaimLeaseMs),
) {
  const claimedRows = await db
    .update(reminderJob)
    .set({
      status: "claimed",
      claimedAt: now,
      lastAttemptAt: now,
      attemptCount: sql`${reminderJob.attemptCount} + 1`,
      updatedAt: now,
    })
    .where(
      or(
        and(
          eq(reminderJob.status, "pending"),
          lte(reminderJob.scheduledFor, now),
        ),
        and(
          eq(reminderJob.status, "claimed"),
          isNotNull(reminderJob.claimedAt),
          lte(reminderJob.claimedAt, staleClaimBefore),
          lte(reminderJob.scheduledFor, now),
        ),
      ),
    )
    .returning()

  return claimedRows.map(toReminderJobRecord)
}

export async function markReminderJobSucceededRecord(
  reminderJobId: string,
  completedAt = new Date(),
) {
  const [record] = await db
    .update(reminderJob)
    .set({
      status: "succeeded",
      completedAt,
      updatedAt: completedAt,
    })
    .where(eq(reminderJob.id, reminderJobId))
    .returning()

  return record ? toReminderJobRecord(record) : null
}

export async function recordReminderJobDispatchFailureRecord(
  reminderJobId: string,
  lastError: string,
  attemptedAt = new Date(),
) {
  const [record] = await db
    .update(reminderJob)
    .set({
      claimedAt: attemptedAt,
      lastAttemptAt: attemptedAt,
      lastError,
      updatedAt: attemptedAt,
    })
    .where(eq(reminderJob.id, reminderJobId))
    .returning()

  return record ? toReminderJobRecord(record) : null
}
