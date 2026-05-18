import handler from "@tanstack/react-start/server-entry"

import {
  benchmarkPricingRefreshCron,
} from "@/features/benchmark-pricing"
import {
  refreshCurrentBenchmarkPricing,
} from "@/features/benchmark-pricing/server"
import { runDueReminderJobs } from "@/features/reminders/server"
import { paraglideMiddleware } from "./paraglide/server.js"

export default {
  fetch(request: Request) {
    return paraglideMiddleware(request, () => handler.fetch(request))
  },
  scheduled(event: ScheduledEvent, env: Env, ctx: ExecutionContext) {
    ctx.waitUntil(
      (async () => {
        if (event.cron === benchmarkPricingRefreshCron) {
          const outcome = await refreshCurrentBenchmarkPricing({
            now: new Date(event.scheduledTime),
            apiKey: env.METALS_DEV_API_KEY,
          })

          if (!outcome.refreshed && outcome.error) {
            console.error(outcome.error)
          }
          return
        }

        await runDueReminderJobs(new Date(event.scheduledTime))
      })(),
    )
  },
}
