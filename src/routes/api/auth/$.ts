import { createFileRoute } from '@tanstack/react-router'
import { getAuth } from '@/server/auth'
import { extractBindings } from '@/server/env'

export const Route = createFileRoute('/api/auth/$' as never)({
  server: {
    handlers: {
      GET: ({ request, context }) => getAuth(extractBindings(context)).handler(request),
      POST: ({ request, context }) => getAuth(extractBindings(context)).handler(request),
    },
  },
})
