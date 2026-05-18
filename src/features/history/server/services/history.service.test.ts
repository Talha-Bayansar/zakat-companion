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

  it("returns cycles for the resolved active profile only", async () => {
    resolveCurrentActiveProfile.mockResolvedValue({
      id: "profile-1",
      ownerId: "user-1",
      role: "owner",
    })
    listHistoryCycleRecordsByProfileId.mockResolvedValue({
      items: [
        {
          id: "cycle-1",
          profileId: "profile-1",
          sourceSnapshotId: "snapshot-1",
          state: "due",
          dueAt: new Date("2026-05-16T09:00:00.000Z"),
          paidAt: null,
          createdAt: new Date("2026-05-15T09:00:00.000Z"),
          updatedAt: new Date("2026-05-15T09:00:00.000Z"),
          sourceSnapshot: {
            id: "snapshot-1",
            capturedAt: new Date("2026-05-15T08:59:00.000Z"),
            madhab: "hanafi",
            nisabBenchmark: "gold",
            calculationVersion: "wealth-snapshot-v1",
            netZakatableBase: "1200.00",
            isAboveNisab: true,
            isZakatDue: true,
            fiqhExplanation: null,
          },
          reminderJobs: [
            {
              id: "job-1",
              profileId: "profile-1",
              dedupeKey: "zakat_due:profile-1:cycle-1:due",
              kind: "zakat_due",
              zakatCycleId: "cycle-1",
              phase: "due",
              scheduledFor: new Date("2026-05-16T09:00:00.000Z"),
              status: "claimed",
              attemptCount: 1,
              claimedAt: new Date("2026-05-16T09:01:00.000Z"),
              completedAt: null,
              lastAttemptAt: new Date("2026-05-16T09:01:00.000Z"),
              lastError: null,
              createdAt: new Date("2026-05-16T09:00:00.000Z"),
              updatedAt: new Date("2026-05-16T09:01:00.000Z"),
              deliveryAttempts: [
                {
                  id: "attempt-1",
                  reminderJobId: "job-1",
                  subscriptionId: "subscription-1",
                  channel: "web_push",
                  kind: "zakat_due",
                  status: "failed",
                  attemptedAt: new Date("2026-05-16T09:01:30.000Z"),
                  deliveredAt: null,
                  errorMessage: "temporary failure",
                },
              ],
            },
          ],
        },
      ],
      page: 1,
      pageSize: 10,
      hasMore: false,
    })

    await expect(
      listHistoryCycles(
        {
          userId: "user-1",
          activeProfileId: "profile-stale",
        },
        {
          page: 1,
          pageSize: 10,
        },
      ),
    ).resolves.toMatchObject({
      items: [
        {
          id: "cycle-1",
          profileId: "profile-1",
          sourceSnapshot: {
            id: "snapshot-1",
            madhab: "hanafi",
          },
          reminderJobs: [
            {
              kind: "zakat_due",
              deliveryAttempts: [
                {
                  status: "failed",
                  channel: "web_push",
                },
              ],
            },
          ],
        },
      ],
      page: 1,
      pageSize: 10,
      hasMore: false,
    })

    expect(listHistoryCycleRecordsByProfileId).toHaveBeenCalledWith("profile-1", {
      page: 1,
      pageSize: 10,
    })
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
