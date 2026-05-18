import { m } from "@/paraglide/messages"
import { resolveCurrentActiveProfile } from "@/features/profiles/server/services/profile-access.service"

import {
  notificationDeliveryPayloadSchema,
  notificationSubscriptionSchema,
} from "../../lib/notifications.schemas"
import type {
  NotificationDeliveryPayload,
  NotificationSubscriptionRecord,
} from "../../lib/notifications.types"
import {
  disableNotificationSubscriptionRecord,
  expireNotificationSubscriptionRecord,
  failNotificationSubscriptionRecord,
  getNotificationSubscriptionRecordById,
  listActiveNotificationSubscriptionRecordsByProfileId,
  listNotificationDeliveryAttemptRecordsByReminderJobId,
  listNotificationSubscriptionRecordsByProfileId,
  recordNotificationDeliveryAttemptRecord,
  upsertNotificationSubscriptionRecord,
} from "../repositories/notifications.repository"
import type {
  NotificationSubscriptionRegistrationInput,
  NotificationSubscriptionRemovalInput,
} from "../schemas/notifications.schema"
import {
  getWebPushErrorMessage,
  isNotificationSubscriptionExpiredError,
  isNotificationSubscriptionPermanentFailure,
  sendWebPushNotification,
  WebPushDeliveryError,
} from "./web-push-delivery.service"

type ActiveProfile = {
  id: string
  ownerId: string
  role: "owner" | "manager"
}

type Actor = {
  userId: string
  activeProfileId: string | null
}

export type NotificationDeliveryRunResult = {
  profileId: string
  reminderJobId: string
  attemptedCount: number
  succeededCount: number
  failedCount: number
  expiredCount: number
  firstFailureMessage: string | null
}

export class NotificationServiceError extends Error {
  readonly code:
    | "UNAUTHENTICATED"
    | "NO_ACTIVE_PROFILE"
    | "FORBIDDEN"
    | "NOT_FOUND"
    | "DELIVERY_FAILED"

  constructor(
    code: NotificationServiceError["code"],
    message: string,
  ) {
    super(message)
    this.name = "NotificationServiceError"
    this.code = code
  }
}

async function requireCurrentActiveProfile(actor: Actor) {
  const profile = (await resolveCurrentActiveProfile(actor)) as ActiveProfile | null

  return profile
}

async function requireOwnerActiveProfile(actor: Actor) {
  const profile = await requireCurrentActiveProfile(actor)

  if (!profile) {
    return null
  }

  if (profile.role !== "owner") {
    throw new NotificationServiceError(
      "FORBIDDEN",
      m.profile_access_owner_only(),
    )
  }

  return profile
}

async function requireNotificationSubscriptionRecord(
  profileId: string,
  subscriptionId: string,
) {
  const record = await getNotificationSubscriptionRecordById(subscriptionId)

  if (!record || record.profileId !== profileId) {
    throw new NotificationServiceError(
      "NOT_FOUND",
      m.notification_subscription_not_found(),
    )
  }

  return record
}

async function requireActiveNotificationSubscriptionRecord(
  profileId: string,
  subscriptionId: string,
) {
  const record = await requireNotificationSubscriptionRecord(
    profileId,
    subscriptionId,
  )

  if (record.status !== "active") {
    throw new NotificationServiceError(
      "NOT_FOUND",
      m.notification_subscription_not_found(),
    )
  }

  return record
}

function ensureNotificationPayload(
  profileId: string,
  payload: NotificationDeliveryPayload,
) {
  const parsed = notificationDeliveryPayloadSchema.parse(payload)

  if (parsed.profileId !== profileId) {
    throw new NotificationServiceError(
      "DELIVERY_FAILED",
      m.notification_delivery_failed(),
    )
  }

  return parsed
}

export async function listNotificationSubscriptions(actor: Actor) {
  const profile = await requireOwnerActiveProfile(actor)

  if (!profile) {
    return null
  }

  return listNotificationSubscriptionRecordsByProfileId(profile.id)
}

export async function registerNotificationSubscription(
  actor: Actor,
  input: NotificationSubscriptionRegistrationInput,
) {
  const profile = await requireOwnerActiveProfile(actor)

  if (!profile) {
    throw new NotificationServiceError(
      "NO_ACTIVE_PROFILE",
      m.notification_no_active_profile(),
    )
  }

  const parsed = notificationSubscriptionSchema
    .pick({
      channel: true,
      endpoint: true,
      keys: true,
    })
    .parse(input)

  return upsertNotificationSubscriptionRecord({
    profileId: profile.id,
    channel: parsed.channel,
    endpoint: parsed.endpoint,
    keys: parsed.keys,
    expiresAt: input.expiresAt ?? null,
  })
}

export async function removeNotificationSubscription(
  actor: Actor,
  input: NotificationSubscriptionRemovalInput,
) {
  const profile = await requireOwnerActiveProfile(actor)

  if (!profile) {
    throw new NotificationServiceError(
      "NO_ACTIVE_PROFILE",
      m.notification_no_active_profile(),
    )
  }

  const subscription = await requireNotificationSubscriptionRecord(
    profile.id,
    input.subscriptionId,
  )

  return disableNotificationSubscriptionRecord(subscription.id)
}

async function recordNotificationDeliveryFailure(
  subscription: NotificationSubscriptionRecord,
  reminderJobId: string,
  payload: NotificationDeliveryPayload,
  attemptedAt: Date,
  error: unknown,
) {
  const errorMessage = getWebPushErrorMessage(error)

  await recordNotificationDeliveryAttemptRecord({
    profileId: payload.profileId,
    reminderJobId,
    subscriptionId: subscription.id,
    channel: payload.channel,
    kind: payload.kind,
    status: "failed",
    payload: JSON.stringify(payload),
    attemptedAt,
    deliveredAt: null,
    errorMessage,
  })

  if (isNotificationSubscriptionExpiredError(error)) {
    await expireNotificationSubscriptionRecord(
      subscription.id,
      attemptedAt,
      errorMessage,
    )

    return "expired" as const
  }

  if (isNotificationSubscriptionPermanentFailure(error)) {
    await failNotificationSubscriptionRecord(
      subscription.id,
      attemptedAt,
      errorMessage,
    )

    return "failed" as const
  }

  return "retryable" as const
}

async function recordNotificationDeliverySuccess(
  subscription: NotificationSubscriptionRecord,
  reminderJobId: string,
  payload: NotificationDeliveryPayload,
  attemptedAt: Date,
) {
  await recordNotificationDeliveryAttemptRecord({
    profileId: payload.profileId,
    reminderJobId,
    subscriptionId: subscription.id,
    channel: payload.channel,
    kind: payload.kind,
    status: "succeeded",
    payload: JSON.stringify(payload),
    attemptedAt,
    deliveredAt: attemptedAt,
    errorMessage: null,
  })
}

type DeliveryPersistenceMode = "persist" | "ephemeral"

function classifyNotificationDeliveryFailure(error: unknown) {
  if (isNotificationSubscriptionExpiredError(error)) {
    return "expired" as const
  }

  if (isNotificationSubscriptionPermanentFailure(error)) {
    return "failed" as const
  }

  return "retryable" as const
}

async function deliverNotificationPayloadToSubscriptions(
  subscriptions: NotificationSubscriptionRecord[],
  reminderJobId: string | null,
  payload: NotificationDeliveryPayload,
  now: Date,
  mode: DeliveryPersistenceMode,
): Promise<Pick<
  NotificationDeliveryRunResult,
  "attemptedCount" | "succeededCount" | "failedCount" | "expiredCount"
> &
  Pick<NotificationDeliveryRunResult, "firstFailureMessage">> {
  let succeededCount = 0
  let failedCount = 0
  let expiredCount = 0
  let firstFailureMessage: string | null = null

  for (const subscription of subscriptions) {
    try {
      const response = await sendWebPushNotification(subscription, payload)
      const statusCode =
        response &&
        typeof response === "object" &&
        "statusCode" in response &&
        typeof (response as { statusCode?: unknown }).statusCode === "number"
          ? (response as { statusCode: number }).statusCode
          : 201

      if (statusCode >= 200 && statusCode < 300) {
        if (mode === "persist") {
          await recordNotificationDeliverySuccess(
            subscription,
            reminderJobId ?? "",
            payload,
            now,
          )
        }

        succeededCount += 1
        continue
      }

      const failure = new WebPushDeliveryError(
        "SEND_FAILED",
        m.notification_delivery_failed(),
        statusCode,
      )
      const errorMessage = getWebPushErrorMessage(failure)

      if (!firstFailureMessage) {
        firstFailureMessage = errorMessage
      }

      if (mode === "persist") {
        const outcome = await recordNotificationDeliveryFailure(
          subscription,
          reminderJobId ?? "",
          payload,
          now,
          failure,
        )

        if (outcome === "expired") {
          expiredCount += 1
        } else {
          failedCount += 1
        }

        continue
      }

      if (classifyNotificationDeliveryFailure(failure) === "expired") {
        expiredCount += 1
      } else {
        failedCount += 1
      }
    } catch (error) {
      if (mode === "persist") {
        const outcome = await recordNotificationDeliveryFailure(
          subscription,
          reminderJobId ?? "",
          payload,
          now,
          error,
        )
        const errorMessage = getWebPushErrorMessage(error)

        if (!firstFailureMessage) {
          firstFailureMessage = errorMessage
        }

        if (outcome === "expired") {
          expiredCount += 1
        } else {
          failedCount += 1
        }

        continue
      }

      if (classifyNotificationDeliveryFailure(error) === "expired") {
        expiredCount += 1
      } else {
        failedCount += 1
      }

      if (!firstFailureMessage) {
        firstFailureMessage = getWebPushErrorMessage(error)
      }
    }
  }

  return {
    attemptedCount: subscriptions.length,
    succeededCount,
    failedCount,
    expiredCount,
    firstFailureMessage,
  }
}

export async function sendNotificationPayloadToProfile(
  profileId: string,
  reminderJobId: string,
  payload: NotificationDeliveryPayload,
  now = new Date(),
): Promise<NotificationDeliveryRunResult> {
  const parsed = ensureNotificationPayload(profileId, payload)
  const [subscriptions, attempts] = await Promise.all([
    listActiveNotificationSubscriptionRecordsByProfileId(profileId),
    listNotificationDeliveryAttemptRecordsByReminderJobId(reminderJobId),
  ])

  const succeededSubscriptionIds = new Set(
    attempts
      .filter((attempt) => attempt.status === "succeeded")
      .map((attempt) => attempt.subscriptionId),
  )
  const pendingSubscriptions = subscriptions.filter(
    (subscription) => !succeededSubscriptionIds.has(subscription.id),
  )

  const deliveryResult = await deliverNotificationPayloadToSubscriptions(
    pendingSubscriptions,
    reminderJobId,
    parsed,
    now,
    "persist",
  )

  return {
    profileId,
    reminderJobId,
    attemptedCount: pendingSubscriptions.length,
    succeededCount: deliveryResult.succeededCount,
    failedCount: deliveryResult.failedCount,
    expiredCount: deliveryResult.expiredCount,
    firstFailureMessage: deliveryResult.firstFailureMessage,
  }
}

export async function getNotificationSubscription(
  actor: Actor,
  input: NotificationSubscriptionRemovalInput,
) {
  const profile = await requireOwnerActiveProfile(actor)

  if (!profile) {
    return null
  }

  return requireNotificationSubscriptionRecord(profile.id, input.subscriptionId)
}
