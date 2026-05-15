import { beforeEach, describe, expect, it, vi } from "vitest"

const resolveCurrentActiveProfile = vi.fn()
const getProfileRecordById = vi.fn()
const getReminderPreferenceRecordByProfileId = vi.fn()
const upsertReminderPreferenceRecord = vi.fn()
const getZakatCycleRecordById = vi.fn()
const createBalanceUpdateReminderJobRecord = vi.fn()
const createZakatDueReminderJobRecord = vi.fn()
const createZakatCycleRecord = vi.fn()
const claimDueReminderJobRecords = vi.fn()

vi.mock(
  "@/features/profiles/server/services/profile-access.service",
  () => ({
    resolveCurrentActiveProfile,
  }),
)

vi.mock(
  "@/features/profiles/server/repositories/profile-access.repository",
  () => ({
    getProfileRecordById,
  }),
)

vi.mock("../repositories/reminders.repository", () => ({
  claimDueReminderJobRecords,
  createBalanceUpdateReminderJobRecord,
  createZakatCycleRecord,
  createZakatDueReminderJobRecord,
  getReminderPreferenceRecordByProfileId,
  getZakatCycleRecordById,
  upsertReminderPreferenceRecord,
}))

import {
  claimDueReminderJobs,
  createBalanceUpdateReminderJob,
  createReminderJob,
  createZakatCycle,
  createZakatDueReminderJob,
  getReminderPreference,
  ReminderServiceError,
  updateReminderPreference,
} from "./reminders.service"

describe("reminders service", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("returns null when there is no active profile", async () => {
    resolveCurrentActiveProfile.mockResolvedValue(null)

    await expect(
      getReminderPreference({
        userId: "user-1",
        activeProfileId: null,
      }),
    ).resolves.toBeNull()
  })

  it("rejects reminder preference changes for delegated managers", async () => {
    resolveCurrentActiveProfile.mockResolvedValue({
      id: "profile-1",
      ownerId: "user-2",
      role: "manager",
    })

    await expect(
      updateReminderPreference(
        {
          userId: "user-1",
          activeProfileId: "profile-1",
        },
        {
          balanceUpdateCadence: "monthly",
          timezone: "Europe/Brussels",
          quietHours: null,
          zakatDueFollowUpEnabled: true,
        },
      ),
    ).rejects.toBeInstanceOf(ReminderServiceError)
  })

  it("updates reminder preferences for the active owned profile", async () => {
    resolveCurrentActiveProfile.mockResolvedValue({
      id: "profile-1",
      ownerId: "user-1",
      role: "owner",
    })
    upsertReminderPreferenceRecord.mockResolvedValue({
      profileId: "profile-1",
      balanceUpdateCadence: "weekly",
      timezone: "Europe/Brussels",
      quietHours: null,
      zakatDueFollowUpEnabled: false,
      createdAt: new Date("2026-05-15T09:00:00.000Z"),
      updatedAt: new Date("2026-05-15T09:00:00.000Z"),
    })

    await updateReminderPreference(
      {
        userId: "user-1",
        activeProfileId: "profile-1",
      },
      {
        balanceUpdateCadence: "weekly",
        timezone: "Europe/Brussels",
        quietHours: null,
        zakatDueFollowUpEnabled: false,
      },
    )

    expect(upsertReminderPreferenceRecord).toHaveBeenCalledWith("profile-1", {
      balanceUpdateCadence: "weekly",
      timezone: "Europe/Brussels",
      quietHours: null,
      zakatDueFollowUpEnabled: false,
    })
  })

  it("creates a balance update job for an existing profile", async () => {
    getProfileRecordById.mockResolvedValue({
      id: "profile-1",
      ownerId: "user-1",
    })
    createBalanceUpdateReminderJobRecord.mockResolvedValue({
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
    })

    await createBalanceUpdateReminderJob({
      profileId: "profile-1",
      scheduledFor: new Date("2026-05-15T09:00:00.000Z"),
    })

    expect(createBalanceUpdateReminderJobRecord).toHaveBeenCalledWith({
      profileId: "profile-1",
      scheduledFor: new Date("2026-05-15T09:00:00.000Z"),
    })
  })

  it("creates a zakat due job when the cycle belongs to the profile", async () => {
    getZakatCycleRecordById.mockResolvedValue({
      id: "cycle-1",
      profileId: "profile-1",
      sourceSnapshotId: "snapshot-1",
      state: "due",
      dueAt: new Date("2026-05-16T09:00:00.000Z"),
      paidAt: null,
      createdAt: new Date("2026-05-15T09:00:00.000Z"),
      updatedAt: new Date("2026-05-15T09:00:00.000Z"),
    })
    createZakatDueReminderJobRecord.mockResolvedValue({
      id: "job-2",
      profileId: "profile-1",
      dedupeKey: "zakat_due:profile-1:cycle-1:follow_up",
      kind: "zakat_due",
      zakatCycleId: "cycle-1",
      phase: "follow_up",
      scheduledFor: new Date("2026-05-15T09:00:00.000Z"),
      status: "pending",
      attemptCount: 0,
      claimedAt: null,
      completedAt: null,
      lastAttemptAt: null,
      lastError: null,
      createdAt: new Date("2026-05-15T09:00:00.000Z"),
      updatedAt: new Date("2026-05-15T09:00:00.000Z"),
    })

    await createZakatDueReminderJob({
      profileId: "profile-1",
      zakatCycleId: "cycle-1",
      phase: "follow_up",
      scheduledFor: new Date("2026-05-15T09:00:00.000Z"),
    })

    expect(createZakatDueReminderJobRecord).toHaveBeenCalledWith({
      profileId: "profile-1",
      zakatCycleId: "cycle-1",
      phase: "follow_up",
      scheduledFor: new Date("2026-05-15T09:00:00.000Z"),
    })
  })

  it("dispatches through the generic job creator", async () => {
    getProfileRecordById.mockResolvedValue({
      id: "profile-1",
      ownerId: "user-1",
    })
    createBalanceUpdateReminderJobRecord.mockResolvedValue({
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
    })

    await createReminderJob({
      kind: "balance_update",
      profileId: "profile-1",
      scheduledFor: new Date("2026-05-15T09:00:00.000Z"),
    })

    expect(createBalanceUpdateReminderJobRecord).toHaveBeenCalledTimes(1)
  })

  it("creates zakat cycles and claims due jobs", async () => {
    createZakatCycleRecord.mockResolvedValue({
      id: "cycle-1",
      profileId: "profile-1",
      sourceSnapshotId: "snapshot-1",
      state: "open",
      dueAt: new Date("2026-05-16T09:00:00.000Z"),
      paidAt: null,
      createdAt: new Date("2026-05-15T09:00:00.000Z"),
      updatedAt: new Date("2026-05-15T09:00:00.000Z"),
    })
    claimDueReminderJobRecords.mockResolvedValue([
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
        claimedAt: new Date("2026-05-15T09:00:00.000Z"),
        completedAt: null,
        lastAttemptAt: new Date("2026-05-15T09:00:00.000Z"),
        lastError: null,
        createdAt: new Date("2026-05-15T09:00:00.000Z"),
        updatedAt: new Date("2026-05-15T09:00:00.000Z"),
      },
    ])

    await createZakatCycle({
      profileId: "profile-1",
      sourceSnapshotId: "snapshot-1",
      state: "open",
      dueAt: new Date("2026-05-16T09:00:00.000Z"),
      paidAt: null,
    })

    const claimed = await claimDueReminderJobs(
      new Date("2026-05-15T09:00:00.000Z"),
    )

    expect(claimed).toHaveLength(1)
    expect(claimDueReminderJobRecords).toHaveBeenCalledWith(
      new Date("2026-05-15T09:00:00.000Z"),
    )
  })
})
