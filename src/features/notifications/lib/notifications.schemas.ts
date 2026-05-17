import { z } from "zod"

import {
  notificationChannelValues,
  notificationDeliveryKindValues,
} from "./notifications.constants"

export const notificationChannelSchema = z.enum(notificationChannelValues)

export const notificationDeliveryKindSchema = z.enum(
  notificationDeliveryKindValues,
)

export const notificationSubscriptionKeysSchema = z.object({
  auth: z.string().trim().min(1),
  p256dh: z.string().trim().min(1),
})

export const notificationSubscriptionSchema = z.object({
  channel: notificationChannelSchema.default("web_push"),
  endpoint: z.string().trim().min(1),
  keys: notificationSubscriptionKeysSchema,
  profileId: z.string().trim().min(1),
  createdAt: z.date(),
  updatedAt: z.date(),
})

export const notificationDeliveryPayloadSchema = z.object({
  channel: notificationChannelSchema.default("web_push"),
  kind: notificationDeliveryKindSchema,
  profileId: z.string().trim().min(1),
  title: z.string().trim().min(1),
  body: z.string().trim().min(1),
  url: z.string().trim().min(1),
  tag: z.string().trim().min(1).nullable(),
})
