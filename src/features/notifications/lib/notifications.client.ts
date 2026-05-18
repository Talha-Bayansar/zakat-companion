import { m } from "@/paraglide/messages"

export type NotificationBrowserSupportStatus =
  | "unsupported"
  | "available"

export type BrowserNotificationPermission = NotificationPermission | "unsupported"

export type BrowserPushSubscriptionRegistration = {
  endpoint: string
  keys: {
    auth: string
    p256dh: string
  }
  expiresAt: Date | null
}

function getNotificationApiSupportStatus() {
  if (
    typeof window === "undefined" ||
    typeof navigator === "undefined" ||
    !("Notification" in window) ||
    !("serviceWorker" in navigator) ||
    !("PushManager" in window)
  ) {
    return "unsupported" as const
  }

  return "available" as const
}

export function getBrowserNotificationPermission():
  | BrowserNotificationPermission
  | "unsupported" {
  if (getNotificationApiSupportStatus() === "unsupported") {
    return "unsupported"
  }

  return Notification.permission
}

export async function requestBrowserNotificationPermission() {
  if (getNotificationApiSupportStatus() === "unsupported") {
    return "unsupported" as const
  }

  if (
    Notification.permission === "granted" ||
    Notification.permission === "denied"
  ) {
    return Notification.permission
  }

  return Notification.requestPermission()
}

function base64UrlToUint8Array(value: string) {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/")
  const padded = normalized.padEnd(
    Math.ceil(normalized.length / 4) * 4,
    "=",
  )

  const decoded = atob(padded)
  const result = new Uint8Array(decoded.length)

  for (let index = 0; index < decoded.length; index += 1) {
    result[index] = decoded.charCodeAt(index)
  }

  return result
}

async function getNotificationServiceWorkerRegistration() {
  if (getNotificationApiSupportStatus() === "unsupported") {
    throw new Error(m.settings_notifications_not_supported_error())
  }

  const registration =
    (await navigator.serviceWorker.getRegistration("/")) ??
    (await navigator.serviceWorker.register("/sw.js", {
      scope: "/",
    }))

  return registration
}

export async function getCurrentBrowserPushSubscription() {
  if (getNotificationApiSupportStatus() === "unsupported") {
    return null
  }

  const registration = await getNotificationServiceWorkerRegistration()

  return registration.pushManager.getSubscription()
}

export async function buildBrowserPushSubscriptionRegistration(
  applicationServerKey: string,
): Promise<BrowserPushSubscriptionRegistration> {
  if (getNotificationApiSupportStatus() === "unsupported") {
    throw new Error(m.settings_notifications_not_supported_error())
  }

  const permission = await requestBrowserNotificationPermission()

  if (permission !== "granted") {
    throw new Error(m.settings_notifications_permission_denied_error())
  }

  const registration = await getNotificationServiceWorkerRegistration()
  const existingSubscription = await registration.pushManager.getSubscription()
  const subscription =
    existingSubscription ??
    (await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: base64UrlToUint8Array(applicationServerKey),
    }))

  const json = subscription.toJSON() as
    | {
        endpoint?: string
        expirationTime?: number | null
        keys?: {
          auth?: string
          p256dh?: string
        } | null
      }
    | null

  if (!json?.endpoint || !json.keys?.auth || !json.keys?.p256dh) {
    throw new Error(m.settings_notifications_subscription_payload_error())
  }

  return {
    endpoint: json.endpoint,
    keys: {
      auth: json.keys.auth,
      p256dh: json.keys.p256dh,
    },
    expiresAt:
      typeof json.expirationTime === "number"
        ? new Date(json.expirationTime)
        : null,
  }
}

export async function unsubscribeCurrentBrowserPushSubscription() {
  const subscription = await getCurrentBrowserPushSubscription()

  if (!subscription) {
    return false
  }

  return subscription.unsubscribe()
}
