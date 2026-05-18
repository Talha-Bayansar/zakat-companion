// @vitest-environment jsdom

import { beforeEach, describe, expect, it, vi } from "vitest"
import { render, screen } from "@testing-library/react"

import { m } from "@/paraglide/messages"

import { HistoryCycleItem } from "./history-cycle-item"

beforeEach(() => {
  vi.restoreAllMocks()
  vi.spyOn(Date.prototype, "toLocaleString").mockImplementation(function (
    this: Date,
  ) {
    return this.toISOString()
  })
})

describe("HistoryCycleItem", () => {
  it("renders the source snapshot summary and reminder activity", () => {
    render(
      <HistoryCycleItem
        cycle={{
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
        }}
        onMarkPaid={vi.fn()}
      />,
    )

    expect(screen.getByText("2026-05-16T09:00:00.000Z")).toBeDefined()
    expect(screen.getByText(m.history_cycle_snapshot_title())).toBeDefined()
    expect(screen.getByText(m.history_cycle_reminders_title())).toBeDefined()
    expect(screen.getByText(/Attempts: 1/)).toBeDefined()
    expect(screen.getByText("Hanafi")).toBeDefined()
    expect(screen.getByText("Gold")).toBeDefined()
    expect(screen.getByText(m.history_cycle_state_due())).toBeDefined()
    expect(screen.getByText(m.history_cycle_payment_unpaid())).toBeDefined()
    expect(screen.getAllByText(m.history_reminder_kind_zakat_due()).length).toBeGreaterThan(0)
    expect(screen.getByText(m.history_reminder_job_status_claimed())).toBeDefined()
    expect(screen.getByText(m.history_reminder_job_status_failed())).toBeDefined()
    expect(screen.getByText(m.history_reminder_job_status_suppressed())).toBeDefined()
    expect(screen.getByText("temporary failure")).toBeDefined()
    expect(screen.getByRole("button", { name: m.history_cycle_mark_paid() })).toBeDefined()
  })
})
