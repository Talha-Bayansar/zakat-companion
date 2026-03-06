import { createFileRoute } from '@tanstack/react-router'
import { executeReminderDelivery } from '@/server/functions/reminders/execute-reminder-delivery'
import { runReminderPlanner } from '@/server/functions/reminders/run-reminder-planner'

export const Route = createFileRoute('/api/reminders/run/')({
  server: {
    handlers: {
      POST: async ({ request }) => {
        let payload: {
          dryRun?: boolean
          now?: string
          limitUsers?: number
          mode?: 'plan' | 'deliver' | 'all'
          limit?: number
        } = {}

        try {
          payload = (await request.json()) as typeof payload
        } catch {
          payload = {}
        }

        const dryRun = payload.dryRun ?? true
        const now = payload.now ? new Date(payload.now) : undefined
        const mode = payload.mode ?? 'all'

        const planning =
          mode === 'deliver'
            ? null
            : await runReminderPlanner({
                dryRun,
                now,
                limitUsers: payload.limitUsers,
              })

        const delivery =
          mode === 'plan'
            ? null
            : await executeReminderDelivery({
                dryRun,
                now,
                limit: payload.limit,
              })

        return Response.json({
          dryRun,
          mode,
          planning,
          delivery,
        })
      },
    },
  },
})
