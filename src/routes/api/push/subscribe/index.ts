import { createFileRoute } from '@tanstack/react-router'
import { registerPushSubscription } from '@/server/functions/notifications/register-push-subscription'

export const Route = createFileRoute('/api/push/subscribe/')({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const payload = (await request.json()) as {
          userId: string
          endpoint: string
          keys: { p256dh: string; auth: string }
        }

        const result = await registerPushSubscription({ data: payload })
        return Response.json(result)
      },
    },
  },
})
