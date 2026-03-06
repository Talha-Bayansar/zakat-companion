import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/api/push/public-key/')({
  server: {
    handlers: {
      GET: async () => {
        const publicKey = process.env.VAPID_PUBLIC_KEY

        if (!publicKey) {
          return Response.json({ error: 'missing_vapid_public_key' }, { status: 500 })
        }

        return Response.json({ publicKey })
      },
    },
  },
})
