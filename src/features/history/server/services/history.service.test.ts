import { beforeEach, describe, expect, it, vi } from "vitest"

const resolveCurrentActiveProfile = vi.fn()
const listHistoryCycleRecordsByProfileId = vi.fn()
const markHistoryCyclePaidRecord = vi.fn()

vi.mock("@/features/profiles/server/services/profile-access.service", () => ({
  resolveCurrentActiveProfile,
}))

vi.mock("../repositories/history.repository", () => ({
  listHistoryCycleRecordsByProfileId,
  markHistoryCyclePaidRecord,
}))

vi.mock("@/paraglide/messages", () => ({
  m: {
    history_mark_cycle_paid_no_active_profile: () =>
      "Select an active profile before marking a cycle as paid.",
    history_mark_cycle_paid_not_found: () =>
      "The selected cycle could not be found.",
  },
}))

import {
  HistoryServiceError,
  listHistoryCycles,
  markCyclePaid,
} from "./history.service"

const actor = {
  userId: "user-1",
  activeProfileId: "profile-1",
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe("history service", () => {
  it("returns an empty page when no profile is active", async () => {
    resolveCurrentActiveProfile.mockResolvedValue(null)

    await expect(
      listHistoryCycles(actor, {
        page: 1,
        pageSize: 10,
      }),
    ).resolves.toEqual({
      items: [],
      page: 1,
      pageSize: 10,
      hasMore: false,
    })
    expect(listHistoryCycleRecordsByProfileId).not.toHaveBeenCalled()
  })

  it("marks the active profile cycle as paid", async () => {
    resolveCurrentActiveProfile.mockResolvedValue({
      id: "profile-1",
      ownerId: "user-1",
      role: "owner",
    })
    markHistoryCyclePaidRecord.mockResolvedValue({
      id: "cycle-1",
      profileId: "profile-1",
      sourceSnapshotId: "snapshot-1",
      state: "paid",
      dueAt: new Date("2026-05-16T09:00:00.000Z"),
      paidAt: new Date("2026-05-17T09:00:00.000Z"),
      createdAt: new Date("2026-05-15T09:00:00.000Z"),
      updatedAt: new Date("2026-05-17T09:00:00.000Z"),
      sourceSnapshot: null,
      reminderJobs: [],
    })

    await expect(
      markCyclePaid(actor, {
        zakatCycleId: "cycle-1",
      }),
    ).resolves.toMatchObject({
      id: "cycle-1",
      state: "paid",
      paidAt: new Date("2026-05-17T09:00:00.000Z"),
    })

    expect(markHistoryCyclePaidRecord).toHaveBeenCalledWith(
      "profile-1",
      "cycle-1",
    )
  })

  it("rejects payment updates when no profile is active", async () => {
    resolveCurrentActiveProfile.mockResolvedValue(null)

    await expect(
      markCyclePaid(actor, {
        zakatCycleId: "cycle-1",
      }),
    ).rejects.toBeInstanceOf(HistoryServiceError)

    expect(markHistoryCyclePaidRecord).not.toHaveBeenCalled()
  })
})
