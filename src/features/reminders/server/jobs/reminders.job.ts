import type { ReminderJobRecord } from "../../lib/reminders.types"
import {
  reminderJobClaimLeaseMs,
} from "../../lib/reminders.constants"
import {
  claimDueReminderJobRecords,
  markReminderJobSucceededRecord,
  recordReminderJobDispatchFailureRecord,
} from "../repositories/reminders.repository"

export type ReminderJobDispatcher = (job: ReminderJobRecord) => Promise<void>

export type RunDueReminderJobsResult = {
  claimedJobs: ReminderJobRecord[]
  succeededCount: number
  retryableFailureCount: number
}

function getErrorMessage(error: unknown) {
  if (error instanceof Error && error.message) {
    return error.message
  }

  return "Reminder job execution failed."
}

function getStaleClaimBefore(now: Date) {
  return new Date(now.getTime() - reminderJobClaimLeaseMs)
}

async function defaultReminderJobDispatcher() {
  return
}

export async function runDueReminderJobs(
  now = new Date(),
  dispatchReminderJob: ReminderJobDispatcher = defaultReminderJobDispatcher,
): Promise<RunDueReminderJobsResult> {
  const claimedJobs = await claimDueReminderJobRecords(
    now,
    getStaleClaimBefore(now),
  )

  let succeededCount = 0
  let retryableFailureCount = 0

  for (const job of claimedJobs) {
    try {
      await dispatchReminderJob(job)
      await markReminderJobSucceededRecord(job.id, now)
      succeededCount += 1
    } catch (error) {
      await recordReminderJobDispatchFailureRecord(
        job.id,
        getErrorMessage(error),
        now,
      )
      retryableFailureCount += 1
    }
  }

  return {
    claimedJobs,
    succeededCount,
    retryableFailureCount,
  }
}
