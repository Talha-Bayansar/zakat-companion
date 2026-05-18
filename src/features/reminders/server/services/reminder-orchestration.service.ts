import { db, type Database } from "@/server/db/client"

import {
  defaultReminderCadence,
  type ReminderCadence,
  type ReminderJobPhase,
} from "../../lib/reminders.constants"
import {
  createBalanceUpdateReminderJobRecord,
  createZakatDueReminderJobRecord,
  getReminderPreferenceRecordByProfileId,
  suppressFutureZakatDueReminderJobRecords,
} from "../repositories/reminders.repository"

type DatabaseLike = Pick<
  Database,
  "select" | "insert" | "update" | "delete"
>

type WealthSnapshotEvent = {
  id: string
  profileId: string
  capturedAt: Date
}

type ZakatCycleEvent = {
  id: string
  profileId: string
  dueAt: Date
}

type PaidCycleEvent = {
  id: string
  profileId: string
  paidAt: Date | null
}

type OrchestrationWork<T> = (database: DatabaseLike) => Promise<T>

const MS_PER_DAY = 24 * 60 * 60 * 1000

const reminderCadenceOffsets: Record<ReminderCadence, number> = {
  daily: 1,
  weekly: 7,
  monthly: 30,
  quarterly: 90,
}

function addDays(date: Date, days: number) {
  return new Date(date.getTime() + days * MS_PER_DAY)
}

function withReminderTransaction<T>(work: OrchestrationWork<T>) {
  return db.transaction(async (transaction) => work(transaction as DatabaseLike))
}

export function calculateBalanceUpdateReminderScheduledFor(
  capturedAt: Date,
  cadence: ReminderCadence,
): Date {
  return addDays(capturedAt, reminderCadenceOffsets[cadence])
}

export function calculateZakatDueReminderScheduledFor(
  dueAt: Date,
  phase: ReminderJobPhase,
): Date {
  switch (phase) {
    case "before_due":
      return addDays(dueAt, -7)
    case "due":
      return dueAt
    case "follow_up":
      return addDays(dueAt, 7)
  }
}

export async function orchestrateWealthSnapshotSave<T extends WealthSnapshotEvent>(
  writeSnapshot: OrchestrationWork<T | null>,
) {
  return withReminderTransaction(async (database) => {
    const snapshot = await writeSnapshot(database)

    if (!snapshot) {
      return null
    }

    const reminderPreference = await getReminderPreferenceRecordByProfileId(
      snapshot.profileId,
      database,
    )
    const scheduledFor = calculateBalanceUpdateReminderScheduledFor(
      snapshot.capturedAt,
      reminderPreference?.balanceUpdateCadence ?? defaultReminderCadence,
    )

    await createBalanceUpdateReminderJobRecord(
      {
        profileId: snapshot.profileId,
        sourceSnapshotId: snapshot.id,
        scheduledFor,
      },
      database,
    )

    return snapshot
  })
}

export async function orchestrateZakatCycleCreation<T extends ZakatCycleEvent>(
  createCycle: OrchestrationWork<T | null>,
) {
  return withReminderTransaction(async (database) => {
    const cycle = await createCycle(database)

    if (!cycle) {
      return null
    }

    const scheduledPhases: Array<{
      phase: ReminderJobPhase
      scheduledFor: Date
    }> = [
      {
        phase: "before_due",
        scheduledFor: calculateZakatDueReminderScheduledFor(
          cycle.dueAt,
          "before_due",
        ),
      },
      {
        phase: "due",
        scheduledFor: calculateZakatDueReminderScheduledFor(cycle.dueAt, "due"),
      },
      {
        phase: "follow_up",
        scheduledFor: calculateZakatDueReminderScheduledFor(
          cycle.dueAt,
          "follow_up",
        ),
      },
    ]

    for (const phase of scheduledPhases) {
      await createZakatDueReminderJobRecord(
        {
          profileId: cycle.profileId,
          zakatCycleId: cycle.id,
          phase: phase.phase,
          scheduledFor: phase.scheduledFor,
        },
        database,
      )
    }

    return cycle
  })
}

export async function orchestrateCyclePayment<T extends PaidCycleEvent>(
  markPaid: OrchestrationWork<T | null>,
) {
  return withReminderTransaction(async (database) => {
    const cycle = await markPaid(database)

    if (!cycle) {
      return null
    }

    await suppressFutureZakatDueReminderJobRecords(
      {
        profileId: cycle.profileId,
        zakatCycleId: cycle.id,
        paidAt: cycle.paidAt ?? new Date(),
      },
      database,
    )

    return cycle
  })
}
