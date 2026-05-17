import {
  reminderJobKindValues,
  type ReminderJobKind,
} from "@/features/reminders/lib/reminders.constants"

export const notificationChannelValues = ["web_push"] as const

export type NotificationChannel = (typeof notificationChannelValues)[number]

export const notificationDeliveryKindValues = reminderJobKindValues

export type NotificationDeliveryKind = ReminderJobKind
