import { z } from "zod"

import {
  notificationChannelSchema,
  notificationDeliveryPayloadSchema,
  notificationSubscriptionKeysSchema,
} from "../../lib/notifications.schemas"

export const notificationSubscriptionRegistrationInputSchema = z.object({
  channel: notificationChannelSchema.default("web_push"),
  endpoint: z.string().trim().url(),
  keys: notificationSubscriptionKeysSchema,
  expiresAt: z.date().nullable().optional(),
})

export const notificationSubscriptionRemovalInputSchema = z.object({
  subscriptionId: z.string().trim().min(1),
})

export const notificationSubscriptionTestDeliveryInputSchema = z.object({
  subscriptionId: z.string().trim().min(1).optional(),
  payload: notificationDeliveryPayloadSchema,
})

export type NotificationSubscriptionRegistrationInput = z.infer<
  typeof notificationSubscriptionRegistrationInputSchema
>

export type NotificationSubscriptionRemovalInput = z.infer<
  typeof notificationSubscriptionRemovalInputSchema
>

export type NotificationSubscriptionTestDeliveryInput = z.infer<
  typeof notificationSubscriptionTestDeliveryInputSchema
>
