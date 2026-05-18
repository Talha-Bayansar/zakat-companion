import { z } from "zod"

import {
  notificationChannelSchema,
  notificationSubscriptionKeysSchema,
} from "../../lib/notifications.schemas"
import type {
  NotificationSubscriptionRegistrationInput as SharedNotificationSubscriptionRegistrationInput,
  NotificationSubscriptionRemovalInput as SharedNotificationSubscriptionRemovalInput,
} from "../../lib/notifications.inputs"

export const notificationSubscriptionRegistrationInputSchema = z.object({
  channel: notificationChannelSchema.default("web_push"),
  endpoint: z.string().trim().url(),
  keys: notificationSubscriptionKeysSchema,
  expiresAt: z.date().nullable().optional(),
})

export const notificationSubscriptionRemovalInputSchema = z.object({
  subscriptionId: z.string().trim().min(1),
})

export type NotificationSubscriptionRegistrationInput =
  SharedNotificationSubscriptionRegistrationInput

export type NotificationSubscriptionRemovalInput =
  SharedNotificationSubscriptionRemovalInput
