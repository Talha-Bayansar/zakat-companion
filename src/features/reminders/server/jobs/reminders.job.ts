import { m } from "@/paraglide/messages"
import { sendNotificationPayloadToProfile } from "@/features/notifications/server"
import type { NotificationDeliveryPayload } from "@/features/notifications"
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

export type ReminderNotificationPayload = NotificationDeliveryPayload

function getErrorMessage(error: unknown) {
  if (error instanceof Error && error.message) {
    return error.message
  }

  return "Reminder job execution failed."
}

function getStaleClaimBefore(now: Date) {
  return new Date(now.getTime() - reminderJobClaimLeaseMs)
}

function buildBalanceUpdateNotificationPayload(
  job: Extract<ReminderJobRecord, { kind: "balance_update" }>,
): ReminderNotificationPayload {
  return {
    channel: "web_push",
    kind: "balance_update",
    profileId: job.profileId,
    title: m.notification_balance_update_title(),
    body: m.notification_balance_update_body(),
    url: "/history",
    tag: `balance-update:${job.dedupeKey}`,
  }
}

function buildZakatDueNotificationPayload(
  job: Extract<ReminderJobRecord, { kind: "zakat_due" }>,
): ReminderNotificationPayload {
  switch (job.phase) {
    case "before_due":
      return {
        channel: "web_push",
        kind: "zakat_due",
        profileId: job.profileId,
        title: m.notification_zakat_due_before_due_title(),
        body: m.notification_zakat_due_before_due_body(),
        url: "/history",
        tag: `zakat-due:${job.dedupeKey}`,
      }
    case "due":
      return {
        channel: "web_push",
        kind: "zakat_due",
        profileId: job.profileId,
        title: m.notification_zakat_due_due_title(),
        body: m.notification_zakat_due_due_body(),
        url: "/history",
        tag: `zakat-due:${job.dedupeKey}`,
      }
    case "follow_up":
      return {
        channel: "web_push",
        kind: "zakat_due",
        profileId: job.profileId,
        title: m.notification_zakat_due_follow_up_title(),
        body: m.notification_zakat_due_follow_up_body(),
        url: "/history",
        tag: `zakat-due:${job.dedupeKey}`,
      }
  }
}

export function buildReminderNotificationPayload(
  job: ReminderJobRecord,
): ReminderNotificationPayload {
  if (job.kind === "balance_update") {
    return buildBalanceUpdateNotificationPayload(job)
  }

  return buildZakatDueNotificationPayload(job)
}

async function defaultReminderJobDispatcher(job: ReminderJobRecord) {
  const payload = buildReminderNotificationPayload(job)

  await sendNotificationPayloadToProfile(
    job.profileId,
    job.id,
    payload,
  )
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
