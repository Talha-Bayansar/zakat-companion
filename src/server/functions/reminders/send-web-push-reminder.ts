import webpush from 'web-push'

type DeliveryResult = {
  ok: boolean
  transient: boolean
  provider: string
  error?: string
  invalidEndpoints?: string[]
}

type PushSubscriptionRow = {
  endpoint: string
  p256dh: string
  auth: string
}

type ReminderPayload = {
  title: string
  body: string
  url: string
  reminderKind?: string
}

function isTransientStatus(statusCode?: number) {
  if (!statusCode) return true
  return statusCode >= 500 || statusCode === 429
}

function isInvalidSubscriptionStatus(statusCode?: number) {
  return statusCode === 404 || statusCode === 410
}

function buildPayload(reminderKind?: string, deepLink?: string): ReminderPayload {
  const url = deepLink ?? '/dashboard'

  switch (reminderKind) {
    case 'due_30d':
      return { title: 'Zakat reminder', body: 'Your zakat due date is in 30 days.', url, reminderKind }
    case 'due_7d':
      return { title: 'Zakat reminder', body: 'Your zakat due date is in 7 days.', url, reminderKind }
    case 'due_1d':
      return { title: 'Zakat reminder', body: 'Your zakat due date is tomorrow.', url, reminderKind }
    case 'due_today':
      return { title: 'Zakat reminder', body: 'Your zakat is due today.', url, reminderKind }
    case 'checkin_monthly':
      return { title: 'Zakat check-in', body: 'Time to refresh your zakat inputs.', url, reminderKind }
    default:
      return { title: 'Zakat reminder', body: 'You have a new zakat reminder.', url, reminderKind }
  }
}

export async function sendWebPushReminder(input: {
  subscriptions: PushSubscriptionRow[]
  reminderKind?: string
  deepLink?: string
}): Promise<DeliveryResult> {
  const publicKey = process.env.VAPID_PUBLIC_KEY
  const privateKey = process.env.VAPID_PRIVATE_KEY
  const contact = process.env.VAPID_CONTACT_EMAIL ?? 'mailto:admin@example.com'

  if (!publicKey || !privateKey) {
    return {
      ok: false,
      transient: false,
      provider: 'web-push',
      error: 'missing_vapid_keys',
    }
  }

  if (!input.subscriptions.length) {
    return {
      ok: false,
      transient: false,
      provider: 'web-push',
      error: 'no_subscription',
    }
  }

  webpush.setVapidDetails(contact, publicKey, privateKey)

  const payload = JSON.stringify(buildPayload(input.reminderKind, input.deepLink))

  const invalidEndpoints: string[] = []
  let sentCount = 0
  let hadTransientFailure = false

  for (const sub of input.subscriptions) {
    try {
      await webpush.sendNotification(
        {
          endpoint: sub.endpoint,
          keys: {
            p256dh: sub.p256dh,
            auth: sub.auth,
          },
        },
        payload,
      )
      sentCount += 1
    } catch (error) {
      const statusCode = (error as { statusCode?: number })?.statusCode

      if (isInvalidSubscriptionStatus(statusCode)) {
        invalidEndpoints.push(sub.endpoint)
        continue
      }

      if (isTransientStatus(statusCode)) {
        hadTransientFailure = true
      }
    }
  }

  if (sentCount > 0) {
    return {
      ok: true,
      transient: false,
      provider: 'web-push',
      invalidEndpoints,
    }
  }

  return {
    ok: false,
    transient: hadTransientFailure,
    provider: 'web-push',
    error: hadTransientFailure ? 'web_push_transient_failure' : 'web_push_delivery_failed',
    invalidEndpoints,
  }
}
