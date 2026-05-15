import type {
  ReminderCadence,
  ReminderJobPhase,
  ReminderJobStatus,
} from "./reminders.constants"
import type { FiqhCycleState } from "@/features/fiqh-calculation"

export type ReminderQuietHours = {
  startTime: string
  endTime: string
}

export type ReminderPreference = {
  balanceUpdateCadence: ReminderCadence
  timezone: string
  quietHours: ReminderQuietHours | null
  zakatDueFollowUpEnabled: boolean
}

export type ReminderPreferenceRecord = ReminderPreference & {
  profileId: string
  createdAt: Date
  updatedAt: Date
}

type ReminderJobBaseRecord = {
  id: string
  profileId: string
  dedupeKey: string
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

export type BalanceUpdateReminderJobRecord = ReminderJobBaseRecord & {
  kind: "balance_update"
  zakatCycleId: null
  phase: null
}

export type ZakatDueReminderJobRecord = ReminderJobBaseRecord & {
  kind: "zakat_due"
  zakatCycleId: string
  phase: ReminderJobPhase
}

export type ReminderJobRecord =
  | BalanceUpdateReminderJobRecord
  | ZakatDueReminderJobRecord

export type ZakatCycleRecord = {
  id: string
  profileId: string
  sourceSnapshotId: string | null
  state: FiqhCycleState
  dueAt: Date
  paidAt: Date | null
  createdAt: Date
  updatedAt: Date
}
