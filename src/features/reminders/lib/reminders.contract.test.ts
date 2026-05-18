import { describe, expect, it } from "vitest"

import {
  defaultReminderCadence,
  reminderCadenceValues,
  reminderJobKindValues,
  reminderJobPhaseValues,
  reminderJobStatusValues,
} from "./reminders.constants"
import {
  createReminderPreferenceFormSchema,
  reminderPreferenceSchema,
  reminderJobSchema,
  reminderQuietHoursSchema,
  zakatCycleSchema,
} from "./reminders.schemas"

describe("reminder contract", () => {
  it("freezes the canonical reminder values", () => {
    expect(reminderCadenceValues).toEqual([
      "daily",
      "weekly",
      "monthly",
      "quarterly",
    ])
    expect(defaultReminderCadence).toBe("monthly")
    expect(reminderJobKindValues).toEqual(["balance_update", "zakat_due"])
    expect(reminderJobPhaseValues).toEqual([
      "before_due",
      "due",
      "follow_up",
    ])
    expect(reminderJobStatusValues).toEqual([
      "pending",
      "claimed",
      "succeeded",
      "failed",
      "suppressed",
    ])
  })

  it("validates reminder preferences", () => {
    expect(
      reminderPreferenceSchema.parse({
        balanceUpdateCadence: "monthly",
        timezone: "Europe/Brussels",
        quietHours: {
          startTime: "22:00",
          endTime: "06:00",
        },
        zakatDueFollowUpEnabled: true,
      }),
    ).toEqual({
      balanceUpdateCadence: "monthly",
      timezone: "Europe/Brussels",
      quietHours: {
        startTime: "22:00",
        endTime: "06:00",
      },
      zakatDueFollowUpEnabled: true,
    })

    expect(
      reminderPreferenceSchema.parse({
        timezone: "Europe/Brussels",
        quietHours: null,
        zakatDueFollowUpEnabled: false,
      }),
    ).toEqual({
      balanceUpdateCadence: "monthly",
      timezone: "Europe/Brussels",
      quietHours: null,
      zakatDueFollowUpEnabled: false,
    })

    expect(
      reminderQuietHoursSchema.parse({
        startTime: "23:00",
        endTime: "07:00",
      }),
    ).toEqual({
      startTime: "23:00",
      endTime: "07:00",
    })

    expect(() =>
      reminderPreferenceSchema.parse({
        balanceUpdateCadence: "monthly",
        timezone: "Not/AZone",
        quietHours: null,
        zakatDueFollowUpEnabled: true,
      }),
    ).toThrow()
  })

  it("validates reminder jobs by kind", () => {
    expect(
      reminderJobSchema.parse({
        id: "job-1",
        profileId: "profile-1",
        dedupeKey: "balance_update:profile-1:2026-05-15T09:00:00.000Z",
        kind: "balance_update",
        zakatCycleId: null,
        phase: null,
        scheduledFor: new Date("2026-05-15T09:00:00.000Z"),
        status: "pending",
        attemptCount: 0,
        claimedAt: null,
        completedAt: null,
        lastAttemptAt: null,
        lastError: null,
        createdAt: new Date("2026-05-15T09:00:00.000Z"),
        updatedAt: new Date("2026-05-15T09:00:00.000Z"),
      }),
    ).toMatchObject({
      kind: "balance_update",
      phase: null,
    })

    expect(
      reminderJobSchema.parse({
        id: "job-2",
        profileId: "profile-1",
        dedupeKey: "zakat_due:profile-1:cycle-1:follow_up",
        kind: "zakat_due",
        zakatCycleId: "cycle-1",
        phase: "follow_up",
        scheduledFor: new Date("2026-05-15T09:00:00.000Z"),
        status: "claimed",
        attemptCount: 2,
        claimedAt: new Date("2026-05-15T09:01:00.000Z"),
        completedAt: null,
        lastAttemptAt: new Date("2026-05-15T09:01:00.000Z"),
        lastError: "temporary failure",
        createdAt: new Date("2026-05-15T09:00:00.000Z"),
        updatedAt: new Date("2026-05-15T09:01:00.000Z"),
      }),
    ).toMatchObject({
      kind: "zakat_due",
      phase: "follow_up",
    })

    expect(
      reminderJobSchema.parse({
        id: "job-3",
        profileId: "profile-1",
        dedupeKey: "zakat_due:profile-1:cycle-1:suppressed",
        kind: "zakat_due",
        zakatCycleId: "cycle-1",
        phase: "follow_up",
        scheduledFor: new Date("2026-05-15T09:00:00.000Z"),
        status: "suppressed",
        attemptCount: 0,
        claimedAt: null,
        completedAt: null,
        lastAttemptAt: null,
        lastError: null,
        createdAt: new Date("2026-05-15T09:00:00.000Z"),
        updatedAt: new Date("2026-05-15T09:00:00.000Z"),
      }),
    ).toMatchObject({
      status: "suppressed",
    })
  })

  it("validates reminder preference form rules", () => {
    const reminderPreferenceFormSchema = createReminderPreferenceFormSchema({
      requiredTimezone: "Timezone is required.",
      invalidTimezone: "Timezone is invalid.",
      requiredQuietHoursStartTime: "Quiet hours start is required.",
      requiredQuietHoursEndTime: "Quiet hours end is required.",
      invalidQuietHoursWindow: "Quiet hours window is invalid.",
    })

    expect(
      reminderPreferenceFormSchema.parse({
        balanceUpdateCadence: "monthly",
        timezone: "Europe/Brussels",
        quietHoursEnabled: "enabled",
        quietHoursStartTime: "22:00",
        quietHoursEndTime: "06:00",
        zakatDueFollowUpEnabled: "enabled",
      }),
    ).toMatchObject({
      quietHoursEnabled: "enabled",
    })

    expect(() =>
      reminderPreferenceFormSchema.parse({
        balanceUpdateCadence: "monthly",
        timezone: "Europe/Brussels",
        quietHoursEnabled: "enabled",
        quietHoursStartTime: "22:00",
        quietHoursEndTime: "22:00",
        zakatDueFollowUpEnabled: "enabled",
      }),
    ).toThrow()
  })

  it("validates zakat cycles", () => {
    expect(
      zakatCycleSchema.parse({
        id: "cycle-1",
        profileId: "profile-1",
        sourceSnapshotId: "snapshot-1",
        state: "due",
        dueAt: new Date("2026-05-16T09:00:00.000Z"),
        paidAt: null,
        createdAt: new Date("2026-05-15T09:00:00.000Z"),
        updatedAt: new Date("2026-05-15T09:00:00.000Z"),
      }),
    ).toMatchObject({
      state: "due",
    })
  })
})
