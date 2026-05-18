self.addEventListener("push", (event) => {
  const fallbackPayload = {
    title: "Zakat Companion",
    body: "Open the app to review your reminder.",
    url: "/app",
    tag: null,
  }

  let payload = fallbackPayload

  if (event.data) {
    try {
      const parsed = event.data.json()

      if (parsed && typeof parsed === "object") {
        payload = {
          title:
            typeof parsed.title === "string" && parsed.title.trim().length > 0
              ? parsed.title
              : fallbackPayload.title,
          body:
            typeof parsed.body === "string" && parsed.body.trim().length > 0
              ? parsed.body
              : fallbackPayload.body,
          url:
            typeof parsed.url === "string" && parsed.url.trim().length > 0
              ? parsed.url
              : fallbackPayload.url,
          tag:
            typeof parsed.tag === "string" && parsed.tag.trim().length > 0
              ? parsed.tag
              : null,
        }
      }
    } catch {
      payload = fallbackPayload
    }
  }

  event.waitUntil(
    self.registration.showNotification(payload.title, {
      body: payload.body,
      tag: payload.tag ?? undefined,
      data: {
        url: payload.url,
      },
      icon: "/pwa-assets/manifest-icon-192.maskable.png",
      badge: "/pwa-assets/manifest-icon-192.maskable.png",
    }),
  )
})

self.addEventListener("notificationclick", (event) => {
  event.notification.close()

  const targetUrl =
    event.notification?.data && typeof event.notification.data.url === "string"
      ? event.notification.data.url
      : "/app"

  event.waitUntil(
    self.clients.matchAll({
      type: "window",
      includeUncontrolled: true,
    }).then(async (clientsList) => {
      for (const client of clientsList) {
        if ("focus" in client && client.url === new URL(targetUrl, self.location.origin).href) {
          await client.focus()
          return
        }
      }

      if (self.clients.openWindow) {
        await self.clients.openWindow(targetUrl)
      }
    }),
  )
})
