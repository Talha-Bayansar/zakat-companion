import { runReminderPlanner } from '@/server/functions/reminders/run-reminder-planner'

export async function POST({ request }: { request: Request }) {
  let payload: { dryRun?: boolean; now?: string; limitUsers?: number } = {}

  try {
    payload = (await request.json()) as typeof payload
  } catch {
    payload = {}
  }

  const result = await runReminderPlanner({
    dryRun: payload.dryRun ?? true,
    now: payload.now ? new Date(payload.now) : undefined,
    limitUsers: payload.limitUsers,
  })

  return Response.json(result)
}
