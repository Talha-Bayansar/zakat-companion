import handler from "@tanstack/react-start/server-entry"

import { runDueReminderJobs } from "@/features/reminders/server"
import { paraglideMiddleware } from "./paraglide/server.js"

export default {
  fetch(request: Request) {
    return paraglideMiddleware(request, () => handler.fetch(request))
  },
  scheduled(event: ScheduledEvent, _env: unknown, ctx: ExecutionContext) {
    ctx.waitUntil(
      runDueReminderJobs(new Date(event.scheduledTime)),
    )
  },
}
