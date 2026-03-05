function base64UrlToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const rawData = atob(base64)
  const outputArray = new Uint8Array(rawData.length)

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i)
  }

  return outputArray
}

export async function subscribeToPush(options: { userId: string }) {
  if (!('serviceWorker' in navigator) || !('Notification' in window)) {
    throw new Error('unsupported')
  }

  const registration = await navigator.serviceWorker.register('/sw.js')

  if (!('pushManager' in registration)) {
    throw new Error('push_manager_unavailable')
  }

  const permission = await Notification.requestPermission()

  if (permission !== 'granted') {
    throw new Error('permission_denied')
  }

  const keyResponse = await fetch('/api/push/public-key')
  if (!keyResponse.ok) throw new Error('missing_public_key')
  const { publicKey } = (await keyResponse.json()) as { publicKey?: string }
  if (!publicKey) throw new Error('missing_public_key')

  const existing = await registration.pushManager.getSubscription()
  const subscription =
    existing ??
    (await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: base64UrlToUint8Array(publicKey),
    }))

  const json = subscription.toJSON()
  if (!json.endpoint || !json.keys?.p256dh || !json.keys?.auth) {
    throw new Error('invalid_subscription')
  }

  const response = await fetch('/api/push/subscribe', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      userId: options.userId,
      endpoint: json.endpoint,
      keys: {
        p256dh: json.keys.p256dh,
        auth: json.keys.auth,
      },
    }),
  })

  if (!response.ok) throw new Error('subscribe_failed')
  return { permission }
}

export async function isPushSubscribed() {
  if (!('serviceWorker' in navigator)) return false
  const registration = await navigator.serviceWorker.getRegistration('/sw.js')
  const sub = await registration?.pushManager.getSubscription()
  return Boolean(sub)
}

export async function unsubscribeFromPush(options: { userId: string }) {
  if (!('serviceWorker' in navigator)) return

  const registration = await navigator.serviceWorker.getRegistration('/sw.js')
  const sub = await registration?.pushManager.getSubscription()

  if (!sub) return

  const endpoint = sub.endpoint
  await sub.unsubscribe()

  await fetch('/api/push/unsubscribe', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ userId: options.userId, endpoint }),
  })
}
