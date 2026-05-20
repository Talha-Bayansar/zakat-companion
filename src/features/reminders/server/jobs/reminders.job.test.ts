import { beforeEach, describe, expect, it, vi } from "vitest"
import { m } from "@/paraglide/messages"

const claimDueReminderJobRecords = vi.fn()
const markReminderJobSucceededRecord = vi.fn()
const recordReminderJobDispatchFailureRecord = vi.fn()
const sendNotificationPayloadToProfile = vi.fn()

vi.mock("../repositories/reminders.repository", () => ({
  claimDueReminderJobRecords,
  markReminderJobSucceededRecord,
  recordReminderJobDispatchFailureRecord,
}))

vi.mock("@/features/notifications/server", () => ({
  sendNotificationPayloadToProfile,
}))

import {
  buildReminderNotificationPayload,
  runDueReminderJobs,
} from "./reminders.job"

describe("reminders job runner", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    sendNotificationPayloadToProfile.mockResolvedValue({
      profileId: "profile-1",
      reminderJobId: "job-1",
      attemptedCount: 1,
      succeededCount: 1,
      failedCount: 0,
      expiredCount: 0,
    })
  })

  it("claims due jobs using the lease window and marks them succeeded", async () => {
    const now = new Date("2026-05-15T09:10:00.000Z")
    const claimedJobs = [
      {
        id: "job-1",
        profileId: "profile-1",
        dedupeKey: "balance_update:profile-1:2026-05-15T09:00:00.000Z",
        kind: "balance_update",
        zakatCycleId: null,
        phase: null,
        scheduledFor: new Date("2026-05-15T09:00:00.000Z"),
        status: "claimed",
        attemptCount: 1,
        claimedAt: new Date("2026-05-15T09:09:00.000Z"),
        completedAt: null,
        lastAttemptAt: new Date("2026-05-15T09:09:00.000Z"),
        lastError: null,
        createdAt: new Date("2026-05-15T09:00:00.000Z"),
        updatedAt: new Date("2026-05-15T09:09:00.000Z"),
      },
    ] as const

    claimDueReminderJobRecords.mockResolvedValue([...claimedJobs])
    markReminderJobSucceededRecord.mockResolvedValue(claimedJobs[0])

    const result = await runDueReminderJobs(now)

    expect(claimDueReminderJobRecords).toHaveBeenCalledWith(
      now,
      new Date("2026-05-15T09:05:00.000Z"),
    )
    expect(markReminderJobSucceededRecord).toHaveBeenCalledWith(
      "job-1",
      now,
    )
    expect(recordReminderJobDispatchFailureRecord).not.toHaveBeenCalled()
    expect(result).toMatchObject({
      succeededCount: 1,
      retryableFailureCount: 0,
    })
  })

  it("builds the balance update notification payload", () => {
    expect(
      buildReminderNotificationPayload({
        id: "job-1",
        profileId: "profile-1",
        dedupeKey: "balance_update:profile-1:2026-05-15T09:00:00.000Z",
        kind: "balance_update",
        zakatCycleId: null,
        phase: null,
        scheduledFor: new Date("2026-05-15T09:00:00.000Z"),
        status: "claimed",
        attemptCount: 1,
        claimedAt: new Date("2026-05-15T09:09:00.000Z"),
        completedAt: null,
        lastAttemptAt: new Date("2026-05-15T09:09:00.000Z"),
        lastError: null,
        createdAt: new Date("2026-05-15T09:00:00.000Z"),
        updatedAt: new Date("2026-05-15T09:09:00.000Z"),
      }),
    ).toEqual({
      channel: "web_push",
      kind: "balance_update",
      profileId: "profile-1",
      title: m.notification_balance_update_title(),
      body: m.notification_balance_update_body(),
      url: "/app/wealth-snapshot/edit",
      tag: "balance-update:balance_update:profile-1:2026-05-15T09:00:00.000Z",
    })
  })

  it("builds the zakat due notification payload for the due phase", () => {
    expect(
      buildReminderNotificationPayload({
        id: "job-2",
        profileId: "profile-1",
        dedupeKey: "zakat_due:profile-1:cycle-1:due",
        kind: "zakat_due",
        zakatCycleId: "cycle-1",
        phase: "due",
        scheduledFor: new Date("2026-05-16T09:00:00.000Z"),
        status: "claimed",
        attemptCount: 1,
        claimedAt: new Date("2026-05-16T09:04:00.000Z"),
        completedAt: null,
        lastAttemptAt: new Date("2026-05-16T09:04:00.000Z"),
        lastError: null,
        createdAt: new Date("2026-05-16T09:00:00.000Z"),
        updatedAt: new Date("2026-05-16T09:04:00.000Z"),
      }),
    ).toEqual({
      channel: "web_push",
      kind: "zakat_due",
      profileId: "profile-1",
      title: m.notification_zakat_due_due_title(),
      body: m.notification_zakat_due_due_body(),
      url: "/app/history",
      tag: "zakat-due:zakat_due:profile-1:cycle-1:due",
    })
  })

  it("records retryable failures without marking the job failed terminally", async () => {
    const now = new Date("2026-05-15T09:10:00.000Z")
    claimDueReminderJobRecords.mockResolvedValue([
      {
        id: "job-2",
        profileId: "profile-1",
        dedupeKey: "zakat_due:profile-1:cycle-1:before_due",
        kind: "zakat_due",
        zakatCycleId: "cycle-1",
        phase: "before_due",
        scheduledFor: new Date("2026-05-15T09:00:00.000Z"),
        status: "claimed",
        attemptCount: 1,
        claimedAt: new Date("2026-05-15T09:04:00.000Z"),
        completedAt: null,
        lastAttemptAt: new Date("2026-05-15T09:04:00.000Z"),
        lastError: null,
        createdAt: new Date("2026-05-15T09:00:00.000Z"),
        updatedAt: new Date("2026-05-15T09:04:00.000Z"),
      },
    ])

    const dispatchError = new Error("transport unavailable")
    const dispatchReminderJob = vi.fn().mockRejectedValue(dispatchError)
    recordReminderJobDispatchFailureRecord.mockResolvedValue(null)

    const result = await runDueReminderJobs(now, dispatchReminderJob)

    expect(dispatchReminderJob).toHaveBeenCalledTimes(1)
    expect(markReminderJobSucceededRecord).not.toHaveBeenCalled()
    expect(recordReminderJobDispatchFailureRecord).toHaveBeenCalledWith(
      "job-2",
      "transport unavailable",
      now,
    )
    expect(result).toMatchObject({
      succeededCount: 0,
      retryableFailureCount: 1,
    })
  })
})
