self.addEventListener('push', (event) => {
  let payload = { title: 'Zakat reminder', body: 'You have a new reminder.', url: '/dashboard' }

  try {
    if (event.data) payload = { ...payload, ...event.data.json() }
  } catch {
    // ignore malformed payload
  }

  event.waitUntil(
    self.registration.showNotification(payload.title, {
      body: payload.body,
      data: { url: payload.url },
      icon: '/favicon.ico',
      badge: '/favicon.ico',
    }),
  )
})

self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  const url = event.notification?.data?.url || '/dashboard'

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if ('focus' in client) {
          client.navigate(url)
          return client.focus()
        }
      }
      if (clients.openWindow) return clients.openWindow(url)
      return undefined
    }),
  )
})
