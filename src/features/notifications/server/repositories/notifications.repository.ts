import { and, desc, eq } from "drizzle-orm"

import { db } from "@/server/db/client"
import {
  notificationDeliveryAttempt,
  notificationSubscription,
} from "@/server/db/schema"
import type {
  NotificationDeliveryAttemptRecord,
  NotificationSubscriptionRecord,
} from "../../lib/notifications.types"

function toNotificationSubscriptionRecord(
  record: typeof notificationSubscription.$inferSelect,
): NotificationSubscriptionRecord {
  return {
    id: record.id,
    profileId: record.profileId,
    channel: record.channel,
    endpoint: record.endpoint,
    keys: {
      auth: record.auth,
      p256dh: record.p256dh,
    },
    status: record.status,
    expiresAt: record.expiresAt,
    disabledAt: record.disabledAt,
    expiredAt: record.expiredAt,
    failedAt: record.failedAt,
    lastFailureReason: record.lastFailureReason,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
  }
}

function toNotificationDeliveryAttemptRecord(
  record: typeof notificationDeliveryAttempt.$inferSelect,
): NotificationDeliveryAttemptRecord {
  return {
    id: record.id,
    profileId: record.profileId,
    reminderJobId: record.reminderJobId,
    subscriptionId: record.subscriptionId,
    channel: record.channel,
    kind: record.kind,
    status: record.status,
    payload: record.payload,
    attemptedAt: record.attemptedAt,
    deliveredAt: record.deliveredAt,
    errorMessage: record.errorMessage,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
  }
}

export async function getNotificationSubscriptionRecordById(
  subscriptionId: string,
) {
  const [record] = await db
    .select()
    .from(notificationSubscription)
    .where(eq(notificationSubscription.id, subscriptionId))
    .limit(1)

  return record ? toNotificationSubscriptionRecord(record) : null
}

export async function getNotificationSubscriptionRecordByEndpoint(
  endpoint: string,
) {
  const [record] = await db
    .select()
    .from(notificationSubscription)
    .where(eq(notificationSubscription.endpoint, endpoint))
    .limit(1)

  return record ? toNotificationSubscriptionRecord(record) : null
}

export async function listNotificationSubscriptionRecordsByProfileId(
  profileId: string,
) {
  const records = await db
    .select()
    .from(notificationSubscription)
    .where(eq(notificationSubscription.profileId, profileId))
    .orderBy(desc(notificationSubscription.createdAt))

  return records.map(toNotificationSubscriptionRecord)
}

export async function listActiveNotificationSubscriptionRecordsByProfileId(
  profileId: string,
) {
  const records = await db
    .select()
    .from(notificationSubscription)
    .where(
      and(
        eq(notificationSubscription.profileId, profileId),
        eq(notificationSubscription.status, "active"),
      ),
    )
    .orderBy(desc(notificationSubscription.updatedAt))

  return records.map(toNotificationSubscriptionRecord)
}

export async function listNotificationDeliveryAttemptRecordsByReminderJobId(
  reminderJobId: string,
) {
  const records = await db
    .select()
    .from(notificationDeliveryAttempt)
    .where(eq(notificationDeliveryAttempt.reminderJobId, reminderJobId))
    .orderBy(desc(notificationDeliveryAttempt.attemptedAt))

  return records.map(toNotificationDeliveryAttemptRecord)
}

export async function upsertNotificationSubscriptionRecord(input: {
  profileId: string
  channel: NotificationSubscriptionRecord["channel"]
  endpoint: string
  keys: NotificationSubscriptionRecord["keys"]
  expiresAt: Date | null
}) {
  const [record] = await db
    .insert(notificationSubscription)
    .values({
      id: crypto.randomUUID(),
      profileId: input.profileId,
      channel: input.channel,
      endpoint: input.endpoint,
      auth: input.keys.auth,
      p256dh: input.keys.p256dh,
      status: "active",
      expiresAt: input.expiresAt,
      disabledAt: null,
      expiredAt: null,
      failedAt: null,
      lastFailureReason: null,
    })
    .onConflictDoUpdate({
      target: notificationSubscription.endpoint,
      set: {
        profileId: input.profileId,
        channel: input.channel,
        auth: input.keys.auth,
        p256dh: input.keys.p256dh,
        status: "active",
        expiresAt: input.expiresAt,
        disabledAt: null,
        expiredAt: null,
        failedAt: null,
        lastFailureReason: null,
        updatedAt: new Date(),
      },
    })
    .returning()

  return toNotificationSubscriptionRecord(record)
}

export async function disableNotificationSubscriptionRecord(
  subscriptionId: string,
  disabledAt = new Date(),
) {
  const [record] = await db
    .update(notificationSubscription)
    .set({
      status: "disabled",
      disabledAt,
      updatedAt: disabledAt,
    })
    .where(eq(notificationSubscription.id, subscriptionId))
    .returning()

  return record ? toNotificationSubscriptionRecord(record) : null
}

export async function expireNotificationSubscriptionRecord(
  subscriptionId: string,
  expiredAt = new Date(),
  lastFailureReason: string | null = null,
) {
  const [record] = await db
    .update(notificationSubscription)
    .set({
      status: "expired",
      expiredAt,
      lastFailureReason,
      updatedAt: expiredAt,
    })
    .where(eq(notificationSubscription.id, subscriptionId))
    .returning()

  return record ? toNotificationSubscriptionRecord(record) : null
}

export async function failNotificationSubscriptionRecord(
  subscriptionId: string,
  failedAt = new Date(),
  lastFailureReason: string | null = null,
) {
  const [record] = await db
    .update(notificationSubscription)
    .set({
      status: "failed",
      failedAt,
      lastFailureReason,
      updatedAt: failedAt,
    })
    .where(eq(notificationSubscription.id, subscriptionId))
    .returning()

  return record ? toNotificationSubscriptionRecord(record) : null
}

export async function recordNotificationDeliveryAttemptRecord(input: {
  profileId: string
  reminderJobId: string
  subscriptionId: string
  channel: NotificationDeliveryAttemptRecord["channel"]
  kind: NotificationDeliveryAttemptRecord["kind"]
  status: NotificationDeliveryAttemptRecord["status"]
  payload: string
  attemptedAt: Date
  deliveredAt: Date | null
  errorMessage: string | null
}) {
  const [record] = await db
    .insert(notificationDeliveryAttempt)
    .values({
      id: crypto.randomUUID(),
      profileId: input.profileId,
      reminderJobId: input.reminderJobId,
      subscriptionId: input.subscriptionId,
      channel: input.channel,
      kind: input.kind,
      status: input.status,
      payload: input.payload,
      attemptedAt: input.attemptedAt,
      deliveredAt: input.deliveredAt,
      errorMessage: input.errorMessage,
    })
    .returning()

  return toNotificationDeliveryAttemptRecord(record)
}
