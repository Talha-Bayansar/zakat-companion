import { m } from "@/paraglide/messages"
import { env } from "cloudflare:workers"
import webpush from "web-push"

import type {
  NotificationDeliveryPayload,
  NotificationSubscriptionRecord,
} from "../../lib/notifications.types"

export class WebPushDeliveryError extends Error {
  readonly code: "NOT_CONFIGURED" | "SEND_FAILED"
  readonly statusCode: number | null

  constructor(
    code: WebPushDeliveryError["code"],
    message: string,
    statusCode: number | null = null,
  ) {
    super(message)
    this.name = "WebPushDeliveryError"
    this.code = code
    this.statusCode = statusCode
  }
}

function getRequiredEnvValue(value: string | undefined) {
  const trimmed = value?.trim()

  if (!trimmed) {
    throw new WebPushDeliveryError(
      "NOT_CONFIGURED",
      m.notification_delivery_not_configured(),
    )
  }

  return trimmed
}

function configureWebPushClient() {
  const subject = getRequiredEnvValue(
    env.WEB_PUSH_VAPID_SUBJECT,
  )
  const publicKey = getRequiredEnvValue(
    env.WEB_PUSH_VAPID_PUBLIC_KEY,
  )
  const privateKey = getRequiredEnvValue(
    env.WEB_PUSH_VAPID_PRIVATE_KEY,
  )

  webpush.setVapidDetails(subject, publicKey, privateKey)
}

function getStatusCode(error: unknown) {
  if (error && typeof error === "object" && "statusCode" in error) {
    const statusCode = (error as { statusCode?: unknown }).statusCode

    if (typeof statusCode === "number") {
      return statusCode
    }
  }

  return null
}

export function getWebPushErrorMessage(error: unknown) {
  const statusCode = getStatusCode(error)

  if (statusCode !== null) {
    return m.notification_delivery_failed_with_status({
      statusCode: String(statusCode),
    })
  }

  if (error instanceof Error && error.message) {
    return error.message
  }

  return m.notification_delivery_failed()
}

export function isNotificationSubscriptionExpiredError(error: unknown) {
  const statusCode = getStatusCode(error)

  return statusCode === 404 || statusCode === 410
}

export function isNotificationSubscriptionPermanentFailure(error: unknown) {
  const statusCode = getStatusCode(error)

  return statusCode === 400 || statusCode === 401 || statusCode === 403
}

export async function sendWebPushNotification(
  subscription: Pick<
    NotificationSubscriptionRecord,
    "endpoint" | "keys" | "expiresAt"
  >,
  payload: NotificationDeliveryPayload,
) {
  configureWebPushClient()

  return webpush.sendNotification(
    {
      endpoint: subscription.endpoint,
      keys: subscription.keys,
      expirationTime: subscription.expiresAt
        ? subscription.expiresAt.getTime()
        : undefined,
    },
    JSON.stringify(payload),
  )
}
