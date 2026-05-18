import { describe, expect, it } from "vitest"

import {
  historyCycleHistoryPageSchema,
  historyCycleRecordSchema,
} from "./history.schemas"

describe("history contract", () => {
  it("keeps zakat cycles as the root history record", () => {
    expect(
      historyCycleRecordSchema.parse({
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
          fiqhExplanation: {
            inputs: {
              madhab: "hanafi",
              nisabBenchmark: "gold",
              netZakatableBase: "1200.00",
              nisabThreshold: "100.00",
              hawlStartedAt: null,
              asOf: "2026-05-15T08:59:00.000Z",
            },
            nisab: {
              netZakatableBase: "1200.00",
              nisabThreshold: "100.00",
              difference: "1100.00",
              isAboveNisab: true,
            },
            hawl: {
              startedAt: null,
              asOf: "2026-05-15T08:59:00.000Z",
              elapsedDays: 360,
              requiredDays: 354,
              isComplete: true,
              resetRequired: false,
            },
            dueAmount: {
              rate: "0.025",
              amount: "30.00",
              isZakatDue: true,
            },
            dateRule: {
              policy: "preserve",
              summary: "sample",
            },
          },
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
      }),
    ).toMatchObject({
      id: "cycle-1",
      state: "due",
      sourceSnapshot: {
        id: "snapshot-1",
      },
      reminderJobs: [
        {
          kind: "zakat_due",
          deliveryAttempts: [
            {
              status: "failed",
            },
          ],
        },
      ],
    })
  })

  it("keeps the shared infinite-list page contract", () => {
    expect(
      historyCycleHistoryPageSchema.parse({
        items: [],
        page: 1,
        pageSize: 20,
        hasMore: false,
      }),
    ).toEqual({
      items: [],
      page: 1,
      pageSize: 20,
      hasMore: false,
    })
  })
})
