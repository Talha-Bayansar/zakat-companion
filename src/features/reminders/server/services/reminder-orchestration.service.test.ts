import { beforeEach, describe, expect, it, vi } from "vitest"

const dbMock = {}

const getReminderPreferenceRecordByProfileId = vi.fn()
const createBalanceUpdateReminderJobRecord = vi.fn()
const getZakatCycleRecordBySourceSnapshotId = vi.fn()
const getLatestUnpaidZakatCycleRecordByProfileId = vi.fn()
const createZakatCycleRecord = vi.fn()
const markZakatCycleResetRecord = vi.fn()
const createZakatDueReminderJobRecord = vi.fn()
const suppressPendingZakatDueReminderJobRecords = vi.fn()
const suppressFutureZakatDueReminderJobRecords = vi.fn()

vi.mock("@/server/db/client", () => ({
  db: dbMock,
}))

vi.mock("../repositories/reminders.repository", () => ({
  createBalanceUpdateReminderJobRecord,
  createZakatDueReminderJobRecord,
  getReminderPreferenceRecordByProfileId,
  getZakatCycleRecordBySourceSnapshotId,
  getLatestUnpaidZakatCycleRecordByProfileId,
  createZakatCycleRecord,
  markZakatCycleResetRecord,
  suppressPendingZakatDueReminderJobRecords,
  suppressFutureZakatDueReminderJobRecords,
}))

import {
  calculateBalanceUpdateReminderScheduledFor,
  calculateZakatDueReminderScheduledFor,
  orchestrateCyclePayment,
  orchestrateWealthSnapshotSave,
  orchestrateZakatCycleCreation,
} from "./reminder-orchestration.service"

beforeEach(() => {
  vi.clearAllMocks()
})

describe("reminder orchestration", () => {
  it("saves a snapshot, seeds the balance reminder, and creates a cycle when above nisab", async () => {
    const capturedAt = new Date("2026-05-18T09:00:00.000Z")
    const hawlDueAt = new Date("2027-05-10T09:00:00.000Z")
    const snapshot = {
      id: "snapshot-1",
      profileId: "profile-1",
      capturedAt,
      isAboveNisab: true as const,
      fiqhExplanation: {
        hawl: {
          isComplete: false,
          dueAt: hawlDueAt.toISOString(),
        },
      },
    }
    const writeSnapshot = vi.fn(async () => snapshot)

    getReminderPreferenceRecordByProfileId.mockResolvedValue({
      profileId: "profile-1",
      balanceUpdateCadence: "weekly",
      timezone: "UTC",
      quietHours: null,
      zakatDueFollowUpEnabled: true,
      createdAt: capturedAt,
      updatedAt: capturedAt,
    })
    getZakatCycleRecordBySourceSnapshotId.mockResolvedValue(null)
    createZakatCycleRecord.mockImplementation(async (input) => ({
      id: "cycle-1",
      profileId: input.profileId,
      sourceSnapshotId: input.sourceSnapshotId ?? null,
      state: input.state,
      dueAt: input.dueAt,
      paidAt: input.paidAt ?? null,
      createdAt: capturedAt,
      updatedAt: capturedAt,
    }))
    createBalanceUpdateReminderJobRecord.mockResolvedValue({
      id: "job-1",
      profileId: "profile-1",
      dedupeKey: "balance_update:profile-1:snapshot-1",
      kind: "balance_update",
      zakatCycleId: null,
      phase: null,
      scheduledFor: new Date("2026-05-25T09:00:00.000Z"),
      status: "pending",
      attemptCount: 0,
      claimedAt: null,
      completedAt: null,
      lastAttemptAt: null,
      lastError: null,
      createdAt: capturedAt,
      updatedAt: capturedAt,
    })
    createZakatDueReminderJobRecord.mockResolvedValue({
      id: "job-2",
      profileId: "profile-1",
      dedupeKey: "zakat_due:profile-1:cycle-1:before_due",
      kind: "zakat_due",
      zakatCycleId: "cycle-1",
      phase: "before_due",
      scheduledFor: new Date("2027-05-12T09:00:00.000Z"),
      status: "pending",
      attemptCount: 0,
      claimedAt: null,
      completedAt: null,
      lastAttemptAt: null,
      lastError: null,
      createdAt: capturedAt,
      updatedAt: capturedAt,
    })

    await orchestrateWealthSnapshotSave(writeSnapshot)

    expect(writeSnapshot).toHaveBeenCalledWith(dbMock)
    expect(createBalanceUpdateReminderJobRecord).toHaveBeenCalledWith(
      {
        profileId: "profile-1",
        sourceSnapshotId: "snapshot-1",
        scheduledFor: calculateBalanceUpdateReminderScheduledFor(
          capturedAt,
          "weekly",
        ),
      },
      dbMock,
    )
    expect(createZakatCycleRecord).toHaveBeenCalledWith(
      expect.objectContaining({
        profileId: "profile-1",
        sourceSnapshotId: "snapshot-1",
        state: "open",
        dueAt: hawlDueAt,
        paidAt: null,
      }),
      dbMock,
    )
    expect(createZakatDueReminderJobRecord).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({
        profileId: "profile-1",
        zakatCycleId: "cycle-1",
        phase: "before_due",
        scheduledFor: calculateZakatDueReminderScheduledFor(
          hawlDueAt,
          "before_due",
        ),
      }),
      dbMock,
    )
    expect(createZakatDueReminderJobRecord).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({
        profileId: "profile-1",
        zakatCycleId: "cycle-1",
        phase: "due",
      }),
      dbMock,
    )
    expect(createZakatDueReminderJobRecord).toHaveBeenNthCalledWith(
      3,
      expect.objectContaining({
        profileId: "profile-1",
        zakatCycleId: "cycle-1",
        phase: "follow_up",
      }),
      dbMock,
    )
  })

  it("does not create a second cycle for the same snapshot", async () => {
    const capturedAt = new Date("2026-05-18T09:00:00.000Z")
    const snapshot = {
      id: "snapshot-1",
      profileId: "profile-1",
      capturedAt,
      isAboveNisab: true as const,
    }
    const writeSnapshot = vi.fn(async () => snapshot)

    getReminderPreferenceRecordByProfileId.mockResolvedValue({
      profileId: "profile-1",
      balanceUpdateCadence: "monthly",
      timezone: "UTC",
      quietHours: null,
      zakatDueFollowUpEnabled: true,
      createdAt: capturedAt,
      updatedAt: capturedAt,
    })
    getZakatCycleRecordBySourceSnapshotId.mockResolvedValue({
      id: "cycle-existing",
      profileId: "profile-1",
      sourceSnapshotId: "snapshot-1",
      state: "open",
      dueAt: new Date("2027-05-07T09:00:00.000Z"),
      paidAt: null,
      createdAt: capturedAt,
      updatedAt: capturedAt,
    })

    await orchestrateWealthSnapshotSave(writeSnapshot)

    expect(createZakatCycleRecord).not.toHaveBeenCalled()
    expect(createZakatDueReminderJobRecord).not.toHaveBeenCalled()
  })

  it("does not create a second cycle when the profile already has an active cycle", async () => {
    const capturedAt = new Date("2026-05-18T09:00:00.000Z")
    const snapshot = {
      id: "snapshot-2",
      profileId: "profile-1",
      capturedAt,
      isAboveNisab: true as const,
    }
    const writeSnapshot = vi.fn(async () => snapshot)

    getReminderPreferenceRecordByProfileId.mockResolvedValue({
      profileId: "profile-1",
      balanceUpdateCadence: "monthly",
      timezone: "UTC",
      quietHours: null,
      zakatDueFollowUpEnabled: true,
      createdAt: capturedAt,
      updatedAt: capturedAt,
    })
    getLatestUnpaidZakatCycleRecordByProfileId.mockResolvedValue({
      id: "cycle-active",
      profileId: "profile-1",
      sourceSnapshotId: "snapshot-previous",
      state: "open",
      dueAt: new Date("2027-05-07T09:00:00.000Z"),
      paidAt: null,
      createdAt: capturedAt,
      updatedAt: capturedAt,
    })

    await orchestrateWealthSnapshotSave(writeSnapshot)

    expect(createZakatCycleRecord).not.toHaveBeenCalled()
    expect(createZakatDueReminderJobRecord).not.toHaveBeenCalled()
  })

  it("suppresses the active cycle's zakat reminders when a reset madhab drops below nisab", async () => {
    const capturedAt = new Date("2026-05-18T09:00:00.000Z")
    const snapshot = {
      id: "snapshot-1",
      profileId: "profile-1",
      capturedAt,
      isAboveNisab: false as const,
      fiqhExplanation: {
        dateRule: {
          policy: "reset" as const,
          summary: "A sub-nisab dip resets the current hawl in this version.",
        },
      },
    }
    const writeSnapshot = vi.fn(async () => snapshot)

    getReminderPreferenceRecordByProfileId.mockResolvedValue({
      profileId: "profile-1",
      balanceUpdateCadence: "weekly",
      timezone: "UTC",
      quietHours: null,
      zakatDueFollowUpEnabled: true,
      createdAt: capturedAt,
      updatedAt: capturedAt,
    })
    getLatestUnpaidZakatCycleRecordByProfileId.mockResolvedValue({
      id: "cycle-active",
      profileId: "profile-1",
      sourceSnapshotId: "snapshot-previous",
      state: "open",
      dueAt: new Date("2027-05-07T09:00:00.000Z"),
      paidAt: null,
      createdAt: capturedAt,
      updatedAt: capturedAt,
    })
    suppressPendingZakatDueReminderJobRecords.mockResolvedValue([])

    await orchestrateWealthSnapshotSave(writeSnapshot)

    expect(getLatestUnpaidZakatCycleRecordByProfileId).toHaveBeenCalledWith(
      "profile-1",
      dbMock,
    )
    expect(markZakatCycleResetRecord).toHaveBeenCalledWith(
      {
        profileId: "profile-1",
        zakatCycleId: "cycle-active",
        resetAt: capturedAt,
      },
      dbMock,
    )
    expect(createZakatCycleRecord).not.toHaveBeenCalled()
    expect(suppressPendingZakatDueReminderJobRecords).toHaveBeenCalledWith(
      {
        profileId: "profile-1",
        zakatCycleId: "cycle-active",
        suppressedAt: capturedAt,
      },
      dbMock,
    )
    expect(createZakatDueReminderJobRecord).not.toHaveBeenCalled()
  })

  it("does not suppress the active cycle when a preserve madhab drops below nisab", async () => {
    const capturedAt = new Date("2026-05-18T09:00:00.000Z")
    const snapshot = {
      id: "snapshot-1",
      profileId: "profile-1",
      capturedAt,
      isAboveNisab: false as const,
      fiqhExplanation: {
        dateRule: {
          policy: "preserve" as const,
          summary:
            "A sub-nisab dip preserves the current hawl, but the anniversary can still reset it if nisab is still unmet.",
        },
        hawl: {
          isComplete: false,
        },
      },
    }
    const writeSnapshot = vi.fn(async () => snapshot)

    getReminderPreferenceRecordByProfileId.mockResolvedValue({
      profileId: "profile-1",
      balanceUpdateCadence: "weekly",
      timezone: "UTC",
      quietHours: null,
      zakatDueFollowUpEnabled: true,
      createdAt: capturedAt,
      updatedAt: capturedAt,
    })

    await orchestrateWealthSnapshotSave(writeSnapshot)

    expect(getLatestUnpaidZakatCycleRecordByProfileId).not.toHaveBeenCalled()
    expect(markZakatCycleResetRecord).not.toHaveBeenCalled()
    expect(suppressPendingZakatDueReminderJobRecords).not.toHaveBeenCalled()
    expect(createZakatCycleRecord).not.toHaveBeenCalled()
  })

  it("suppresses the active cycle when a preserved hawl reaches its anniversary below nisab", async () => {
    const capturedAt = new Date("2026-05-18T09:00:00.000Z")
    const snapshot = {
      id: "snapshot-1",
      profileId: "profile-1",
      capturedAt,
      isAboveNisab: false as const,
      fiqhExplanation: {
        dateRule: {
          policy: "preserve" as const,
          summary:
            "A sub-nisab dip preserves the current hawl, but the anniversary can still reset it if nisab is still unmet.",
        },
        hawl: {
          isComplete: true,
        },
      },
    }
    const writeSnapshot = vi.fn(async () => snapshot)

    getReminderPreferenceRecordByProfileId.mockResolvedValue({
      profileId: "profile-1",
      balanceUpdateCadence: "weekly",
      timezone: "UTC",
      quietHours: null,
      zakatDueFollowUpEnabled: true,
      createdAt: capturedAt,
      updatedAt: capturedAt,
    })
    getLatestUnpaidZakatCycleRecordByProfileId.mockResolvedValue({
      id: "cycle-active",
      profileId: "profile-1",
      sourceSnapshotId: "snapshot-previous",
      state: "open",
      dueAt: new Date("2027-05-07T09:00:00.000Z"),
      paidAt: null,
      createdAt: capturedAt,
      updatedAt: capturedAt,
    })
    suppressPendingZakatDueReminderJobRecords.mockResolvedValue([])

    await orchestrateWealthSnapshotSave(writeSnapshot)

    expect(markZakatCycleResetRecord).toHaveBeenCalledWith(
      {
        profileId: "profile-1",
        zakatCycleId: "cycle-active",
        resetAt: capturedAt,
      },
      dbMock,
    )
    expect(suppressPendingZakatDueReminderJobRecords).toHaveBeenCalledWith(
      {
        profileId: "profile-1",
        zakatCycleId: "cycle-active",
        suppressedAt: capturedAt,
      },
      dbMock,
    )
    expect(createZakatCycleRecord).not.toHaveBeenCalled()
  })

  it("seeds the zakat reminder sequence for an explicit cycle creation", async () => {
    const dueAt = new Date("2027-05-07T09:00:00.000Z")
    const createCycle = vi.fn(async () => ({
      id: "cycle-1",
      profileId: "profile-1",
      dueAt,
    }))

    createZakatDueReminderJobRecord.mockResolvedValue({
      id: "job-1",
      profileId: "profile-1",
      dedupeKey: "zakat_due:profile-1:cycle-1:before_due",
      kind: "zakat_due",
      zakatCycleId: "cycle-1",
      phase: "before_due",
      scheduledFor: new Date("2027-04-30T09:00:00.000Z"),
      status: "pending",
      attemptCount: 0,
      claimedAt: null,
      completedAt: null,
      lastAttemptAt: null,
      lastError: null,
      createdAt: dueAt,
      updatedAt: dueAt,
    })

    await orchestrateZakatCycleCreation(createCycle)

    expect(createCycle).toHaveBeenCalledWith(dbMock)
    expect(createZakatDueReminderJobRecord).toHaveBeenCalledTimes(3)
    expect(createZakatDueReminderJobRecord).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({
        phase: "before_due",
        scheduledFor: calculateZakatDueReminderScheduledFor(dueAt, "before_due"),
      }),
      dbMock,
    )
    expect(createZakatDueReminderJobRecord).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({
        phase: "due",
        scheduledFor: calculateZakatDueReminderScheduledFor(dueAt, "due"),
      }),
      dbMock,
    )
    expect(createZakatDueReminderJobRecord).toHaveBeenNthCalledWith(
      3,
      expect.objectContaining({
        phase: "follow_up",
        scheduledFor: calculateZakatDueReminderScheduledFor(
          dueAt,
          "follow_up",
        ),
      }),
      dbMock,
    )
  })

  it("suppresses future zakat reminders when a cycle is paid", async () => {
    const paidAt = new Date("2026-05-20T09:00:00.000Z")
    const markPaid = vi.fn(async () => ({
      id: "cycle-1",
      profileId: "profile-1",
      paidAt,
    }))

    suppressFutureZakatDueReminderJobRecords.mockResolvedValue([])

    await orchestrateCyclePayment(markPaid)

    expect(markPaid).toHaveBeenCalledWith(dbMock)
    expect(suppressFutureZakatDueReminderJobRecords).toHaveBeenCalledWith(
      {
        profileId: "profile-1",
        zakatCycleId: "cycle-1",
        paidAt,
      },
      dbMock,
    )
  })
})
