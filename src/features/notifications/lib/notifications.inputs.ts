import type { NotificationChannel } from "./notifications.constants"
import type { NotificationSubscriptionKeys } from "./notifications.types"

export type NotificationSubscriptionRegistrationInput = {
  channel: NotificationChannel
  endpoint: string
  keys: NotificationSubscriptionKeys
  expiresAt?: Date | null
}

export type NotificationSubscriptionRemovalInput = {
  subscriptionId: string
}
