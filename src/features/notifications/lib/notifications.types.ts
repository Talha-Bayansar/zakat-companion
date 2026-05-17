import type {
  NotificationChannel,
  NotificationDeliveryAttemptStatus,
  NotificationDeliveryKind,
  NotificationSubscriptionStatus,
} from "./notifications.constants"

export type NotificationSubscriptionKeys = {
  auth: string
  p256dh: string
}

export type NotificationSubscriptionRecord = {
  id: string
  profileId: string
  channel: NotificationChannel
  endpoint: string
  keys: NotificationSubscriptionKeys
  status: NotificationSubscriptionStatus
  expiresAt: Date | null
  disabledAt: Date | null
  expiredAt: Date | null
  failedAt: Date | null
  lastFailureReason: string | null
  createdAt: Date
  updatedAt: Date
}

export type NotificationDeliveryAttemptRecord = {
  id: string
  profileId: string
  reminderJobId: string
  subscriptionId: string
  channel: NotificationChannel
  kind: NotificationDeliveryKind
  status: NotificationDeliveryAttemptStatus
  payload: string
  attemptedAt: Date
  deliveredAt: Date | null
  errorMessage: string | null
  createdAt: Date
  updatedAt: Date
}

export type NotificationDeliveryPayload = {
  channel: NotificationChannel
  kind: NotificationDeliveryKind
  profileId: string
  title: string
  body: string
  url: string
  tag: string | null
}
