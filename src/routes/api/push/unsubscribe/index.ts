import { createFileRoute } from '@tanstack/react-router'
import { unregisterPushSubscription } from '@/server/functions/notifications/unregister-push-subscription'

export const Route = createFileRoute('/api/push/unsubscribe/')({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const payload = (await request.json()) as {
          userId: string
          endpoint: string
        }

        const result = await unregisterPushSubscription({ data: payload })
        return Response.json(result)
      },
    },
  },
})
