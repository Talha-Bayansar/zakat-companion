import type { NotificationChannel, NotificationDeliveryKind } from "./notifications.constants"

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
  createdAt: Date
  updatedAt: Date
  revokedAt: Date | null
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
