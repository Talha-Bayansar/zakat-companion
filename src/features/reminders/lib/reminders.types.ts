import type {
  ReminderCadence,
  ReminderJobPhase,
  ReminderJobStatus,
} from "./reminders.constants"

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
  phase: null
}

export type ZakatDueReminderJobRecord = ReminderJobBaseRecord & {
  kind: "zakat_due"
  phase: ReminderJobPhase
}

export type ReminderJobRecord =
  | BalanceUpdateReminderJobRecord
  | ZakatDueReminderJobRecord
