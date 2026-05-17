import { z } from "zod"

import {
  notificationChannelValues,
  notificationDeliveryAttemptStatusValues,
  notificationDeliveryKindValues,
  notificationSubscriptionStatusValues,
} from "./notifications.constants"

export const notificationChannelSchema = z.enum(notificationChannelValues)

export const notificationDeliveryKindSchema = z.enum(
  notificationDeliveryKindValues,
)

export const notificationSubscriptionStatusSchema = z.enum(
  notificationSubscriptionStatusValues,
)

export const notificationDeliveryAttemptStatusSchema = z.enum(
  notificationDeliveryAttemptStatusValues,
)

export const notificationSubscriptionKeysSchema = z.object({
  auth: z.string().trim().min(1),
  p256dh: z.string().trim().min(1),
})

export const notificationSubscriptionSchema = z.object({
  id: z.string().trim().min(1),
  channel: notificationChannelSchema.default("web_push"),
  endpoint: z.string().trim().min(1),
  keys: notificationSubscriptionKeysSchema,
  profileId: z.string().trim().min(1),
  status: notificationSubscriptionStatusSchema.default("active"),
  expiresAt: z.date().nullable(),
  disabledAt: z.date().nullable(),
  expiredAt: z.date().nullable(),
  failedAt: z.date().nullable(),
  lastFailureReason: z.string().trim().min(1).nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
})

export const notificationDeliveryAttemptSchema = z.object({
  id: z.string().trim().min(1),
  profileId: z.string().trim().min(1),
  reminderJobId: z.string().trim().min(1),
  subscriptionId: z.string().trim().min(1),
  channel: notificationChannelSchema.default("web_push"),
  kind: notificationDeliveryKindSchema,
  status: notificationDeliveryAttemptStatusSchema,
  payload: z.string().trim().min(1),
  attemptedAt: z.date(),
  deliveredAt: z.date().nullable(),
  errorMessage: z.string().trim().min(1).nullable(),
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
