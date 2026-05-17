export const reminderCadenceValues = [
  "daily",
  "weekly",
  "monthly",
  "quarterly",
] as const

export type ReminderCadence = (typeof reminderCadenceValues)[number]

export const reminderQuietHourTimePattern =
  /^(?:[01]\d|2[0-3]):[0-5]\d$/

export const reminderJobKindValues = ["balance_update", "zakat_due"] as const

export type ReminderJobKind = (typeof reminderJobKindValues)[number]

export const reminderJobPhaseValues = [
  "before_due",
  "due",
  "follow_up",
] as const

export type ReminderJobPhase = (typeof reminderJobPhaseValues)[number]

export const reminderJobStatusValues = [
  "pending",
  "claimed",
  "succeeded",
  "failed",
] as const

export type ReminderJobStatus = (typeof reminderJobStatusValues)[number]

export const defaultReminderCadence = "monthly" as const

export const reminderJobClaimLeaseMs = 5 * 60 * 1000
