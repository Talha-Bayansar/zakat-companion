import { beforeEach, describe, expect, it, vi } from "vitest"

import { fiqhCalculationVersion } from "@/features/fiqh-calculation"

const benchmarkPricingMocks = vi.hoisted(() => ({
  getCurrentBenchmarkPricing: vi.fn(),
  getBenchmarkPricingFreshnessLabel: vi.fn(
    (benchmarkPricing: { lastSuccessfulAt: Date | string }, referenceTime = new Date()) => {
      const lastSuccessfulAt =
        benchmarkPricing.lastSuccessfulAt instanceof Date
          ? benchmarkPricing.lastSuccessfulAt
          : new Date(benchmarkPricing.lastSuccessfulAt)
      const elapsedHours = Math.floor(
        (referenceTime.getTime() - lastSuccessfulAt.getTime()) / (60 * 60 * 1000),
      )

      return `Updated ${Math.max(0, elapsedHours)} hours ago`
    },
  ),
  isBenchmarkPricingStale: vi.fn(
    (benchmarkPricing: { lastSuccessfulAt: Date | string }, referenceTime = new Date()) => {
      const lastSuccessfulAt =
        benchmarkPricing.lastSuccessfulAt instanceof Date
          ? benchmarkPricing.lastSuccessfulAt
          : new Date(benchmarkPricing.lastSuccessfulAt)

      return (
        referenceTime.getTime() - lastSuccessfulAt.getTime() >
        24 * 60 * 60 * 1000
      )
    },
  ),
}))

const profileServiceMocks = vi.hoisted(() => ({
  resolveCurrentActiveProfile: vi.fn(),
}))

const repositoryMocks = vi.hoisted(() => ({
  getWealthSnapshotWithEntriesRecordByProfileId: vi.fn(),
  listWealthSnapshotHistoryRecordsByProfileId: vi.fn(),
  replaceWealthSnapshotRecord: vi.fn(),
}))

vi.mock("@/paraglide/messages", () => ({
  m: {
    wealth_snapshot_no_active_profile: () => "No active profile",
    wealth_snapshot_benchmark_unavailable: () => "Benchmark pricing unavailable",
  },
}))
vi.mock("@/features/benchmark-pricing", () => benchmarkPricingMocks)
vi.mock("@/features/benchmark-pricing/server", () => benchmarkPricingMocks)
vi.mock("@/features/profiles/server/services/profile-access.service", () => profileServiceMocks)
vi.mock("../repositories/wealth-snapshot.repository", () => repositoryMocks)

import {
  WEALTH_SNAPSHOT_CALCULATION_VERSION,
  calculateWealthSnapshotWriteContext,
  getCurrentWealthSnapshot,
  listWealthSnapshotHistory,
  normalizeWealthSnapshotEntries,
  replaceWealthSnapshot,
} from "./wealth-snapshot.service"
import { wealthCategoryValues } from "../../lib/wealth-snapshot.constants"

const actor = {
  userId: "user-1",
  activeProfileId: "profile-1",
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe("wealth snapshot service", () => {
  it("normalizes entry order and fills missing categories", () => {
    const entries = normalizeWealthSnapshotEntries([
      { category: "debts_liabilities", amount: " 15.00 " },
      { category: "cash", amount: " 100.50 " },
    ])

    expect(entries).toEqual([
      { category: "cash", amount: "100.50" },
      { category: "gold", amount: "0" },
      { category: "silver", amount: "0" },
      { category: "trade_inventory", amount: "0" },
      { category: "receivables", amount: "0" },
      { category: "debts_liabilities", amount: "15.00" },
    ])
    expect(entries.map((entry) => entry.category)).toEqual(wealthCategoryValues)
  })

  it("calculates a frozen snapshot summary", () => {
    expect(
      calculateWealthSnapshotWriteContext([
        { category: "cash", amount: "100.50" },
        { category: "receivables", amount: "2.00" },
        { category: "debts_liabilities", amount: "15.00" },
      ]),
    ).toEqual({
      madhab: null,
      nisabBenchmark: null,
      calculationVersion: WEALTH_SNAPSHOT_CALCULATION_VERSION,
      netZakatableBase: "87.50",
      isAboveNisab: true,
      isZakatDue: null,
      fiqhExplanation: null,
    })
  })

  it("marks non-positive net bases as under nisab", () => {
    expect(
      calculateWealthSnapshotWriteContext([
        { category: "cash", amount: "10.00" },
        { category: "debts_liabilities", amount: "10.00" },
      ]),
    ).toEqual({
      madhab: null,
      nisabBenchmark: null,
      calculationVersion: WEALTH_SNAPSHOT_CALCULATION_VERSION,
      netZakatableBase: "0.00",
      isAboveNisab: false,
      isZakatDue: null,
      fiqhExplanation: null,
    })
  })

  it("wraps snapshot persistence in a transaction with normalized data", async () => {
    profileServiceMocks.resolveCurrentActiveProfile.mockResolvedValue({
      id: "profile-1",
      madhab: "hanafi",
      nisabBenchmark: "gold",
    })
    benchmarkPricingMocks.getCurrentBenchmarkPricing.mockResolvedValue({
      currency: "EUR",
      provider: "metals.dev",
      goldPrice: "87.50",
      silverPrice: "75.00",
      sourceTimestamp: new Date("2026-05-18T12:00:00.000Z"),
      lastSuccessfulAt: new Date("2026-05-18T12:00:00.000Z"),
      createdAt: new Date("2026-05-18T12:00:00.000Z"),
      updatedAt: new Date("2026-05-18T12:00:00.000Z"),
    })
    repositoryMocks.replaceWealthSnapshotRecord.mockResolvedValue({
      id: "snapshot-1",
      profileId: "profile-1",
      capturedAt: new Date("2026-05-13T00:00:00Z"),
      madhab: "hanafi",
      nisabBenchmark: "gold",
      calculationVersion: fiqhCalculationVersion,
      netZakatableBase: "87.50",
      isAboveNisab: true,
      isZakatDue: false,
      createdAt: new Date("2026-05-13T00:00:00Z"),
      updatedAt: new Date("2026-05-13T00:00:00Z"),
      entries: [],
    })

    await replaceWealthSnapshot(actor, {
      entries: [
        { category: "debts_liabilities", amount: "15.00" },
        { category: "cash", amount: "100.50" },
        { category: "receivables", amount: "2.00" },
      ],
    })

    expect(repositoryMocks.replaceWealthSnapshotRecord).toHaveBeenCalledWith(
      expect.objectContaining({
        profileId: "profile-1",
        capturedAt: expect.any(Date),
        entries: [
          { category: "cash", amount: "100.50" },
          { category: "gold", amount: "0" },
          { category: "silver", amount: "0" },
          { category: "trade_inventory", amount: "0" },
          { category: "receivables", amount: "2.00" },
          { category: "debts_liabilities", amount: "15.00" },
        ],
        snapshot: expect.objectContaining({
          madhab: "hanafi",
          nisabBenchmark: "gold",
          calculationVersion: fiqhCalculationVersion,
          netZakatableBase: "87.50",
          isAboveNisab: true,
          isZakatDue: false,
          fiqhExplanation: expect.objectContaining({
            inputs: expect.objectContaining({
              madhab: "hanafi",
              nisabBenchmark: "gold",
            }),
            benchmark: expect.objectContaining({
              currency: "EUR",
              provider: "metals.dev",
              selectedBenchmark: "gold",
              selectedBenchmarkPrice: "87.50",
              nisabThreshold: "87.50",
              freshness: expect.objectContaining({
                isStale: false,
                label: expect.any(String),
              }),
            }),
            nisab: expect.objectContaining({
              isAboveNisab: true,
            }),
            dueAmount: expect.objectContaining({
              isZakatDue: false,
            }),
          }),
        }),
      }),
    )
  })

  it("freezes the captured fiqh output even if profile preferences change later", async () => {
    profileServiceMocks.resolveCurrentActiveProfile
      .mockResolvedValueOnce({
        id: "profile-1",
        madhab: "hanafi",
        nisabBenchmark: "gold",
      })
      .mockResolvedValueOnce({
        id: "profile-1",
        madhab: "maliki",
        nisabBenchmark: "silver",
      })
    repositoryMocks.replaceWealthSnapshotRecord
      .mockResolvedValueOnce({
        id: "snapshot-1",
        profileId: "profile-1",
        capturedAt: new Date("2026-05-13T00:00:00Z"),
        madhab: "hanafi",
        nisabBenchmark: "gold",
        calculationVersion: fiqhCalculationVersion,
        netZakatableBase: "87.50",
        isAboveNisab: true,
        isZakatDue: false,
        createdAt: new Date("2026-05-13T00:00:00Z"),
        updatedAt: new Date("2026-05-13T00:00:00Z"),
        entries: [],
      })
      .mockResolvedValueOnce({
        id: "snapshot-2",
        profileId: "profile-1",
        capturedAt: new Date("2026-05-14T00:00:00Z"),
        madhab: "maliki",
        nisabBenchmark: "silver",
        calculationVersion: fiqhCalculationVersion,
        netZakatableBase: "87.50",
        isAboveNisab: true,
        isZakatDue: false,
        createdAt: new Date("2026-05-14T00:00:00Z"),
        updatedAt: new Date("2026-05-14T00:00:00Z"),
        entries: [],
      })
    benchmarkPricingMocks.getCurrentBenchmarkPricing.mockResolvedValue({
      currency: "EUR",
      provider: "metals.dev",
      goldPrice: "87.50",
      silverPrice: "75.00",
      sourceTimestamp: new Date("2026-05-18T12:00:00.000Z"),
      lastSuccessfulAt: new Date("2026-05-18T12:00:00.000Z"),
      createdAt: new Date("2026-05-18T12:00:00.000Z"),
      updatedAt: new Date("2026-05-18T12:00:00.000Z"),
    })

    const firstCapture = await replaceWealthSnapshot(actor, {
      entries: [
        { category: "cash", amount: "100.50" },
        { category: "receivables", amount: "2.00" },
        { category: "debts_liabilities", amount: "15.00" },
      ],
    })
    const secondCapture = await replaceWealthSnapshot(actor, {
      entries: [
        { category: "cash", amount: "100.50" },
        { category: "receivables", amount: "2.00" },
        { category: "debts_liabilities", amount: "15.00" },
      ],
    })

    expect(firstCapture).toMatchObject({
      madhab: "hanafi",
      nisabBenchmark: "gold",
      calculationVersion: fiqhCalculationVersion,
      netZakatableBase: "87.50",
      isAboveNisab: true,
      isZakatDue: false,
    })
    expect(secondCapture).toMatchObject({
      madhab: "maliki",
      nisabBenchmark: "silver",
      calculationVersion: fiqhCalculationVersion,
      netZakatableBase: "87.50",
      isAboveNisab: true,
      isZakatDue: false,
    })
    expect(firstCapture).not.toBe(secondCapture)
    expect(repositoryMocks.replaceWealthSnapshotRecord).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({
        profileId: "profile-1",
        capturedAt: expect.any(Date),
        snapshot: expect.objectContaining({
          madhab: "hanafi",
          nisabBenchmark: "gold",
          calculationVersion: fiqhCalculationVersion,
          fiqhExplanation: expect.objectContaining({
            benchmark: expect.objectContaining({
              selectedBenchmark: "gold",
            }),
          }),
        }),
      }),
    )
    expect(repositoryMocks.replaceWealthSnapshotRecord).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({
        profileId: "profile-1",
        capturedAt: expect.any(Date),
        snapshot: expect.objectContaining({
          madhab: "maliki",
          nisabBenchmark: "silver",
          calculationVersion: fiqhCalculationVersion,
          fiqhExplanation: expect.objectContaining({
            benchmark: expect.objectContaining({
              selectedBenchmark: "silver",
            }),
          }),
        }),
      }),
    )
  })

  it("allows stale benchmark pricing and freezes its freshness state", async () => {
    profileServiceMocks.resolveCurrentActiveProfile.mockResolvedValue({
      id: "profile-1",
      madhab: "hanafi",
      nisabBenchmark: "silver",
    })
    benchmarkPricingMocks.getCurrentBenchmarkPricing.mockResolvedValue({
      currency: "EUR",
      provider: "metals.dev",
      goldPrice: "87.50",
      silverPrice: "75.00",
      sourceTimestamp: new Date("2026-05-15T12:00:00.000Z"),
      lastSuccessfulAt: new Date("2026-05-15T12:00:00.000Z"),
      createdAt: new Date("2026-05-15T12:00:00.000Z"),
      updatedAt: new Date("2026-05-15T12:00:00.000Z"),
    })
    repositoryMocks.replaceWealthSnapshotRecord.mockResolvedValue({
      id: "snapshot-1",
      profileId: "profile-1",
      capturedAt: new Date("2026-05-18T12:00:00.000Z"),
      madhab: "hanafi",
      nisabBenchmark: "silver",
      calculationVersion: fiqhCalculationVersion,
      netZakatableBase: "87.50",
      isAboveNisab: true,
      isZakatDue: false,
      createdAt: new Date("2026-05-18T12:00:00.000Z"),
      updatedAt: new Date("2026-05-18T12:00:00.000Z"),
      entries: [],
    })

    await replaceWealthSnapshot(actor, {
      entries: [
        { category: "cash", amount: "100.50" },
        { category: "receivables", amount: "2.00" },
        { category: "debts_liabilities", amount: "15.00" },
      ],
    })

    expect(repositoryMocks.replaceWealthSnapshotRecord).toHaveBeenCalledWith(
      expect.objectContaining({
        snapshot: expect.objectContaining({
          fiqhExplanation: expect.objectContaining({
            benchmark: expect.objectContaining({
              selectedBenchmark: "silver",
              freshness: expect.objectContaining({
                isStale: true,
              }),
            }),
          }),
        }),
      }),
    )
  })

  it("returns an empty history page when no profile is active", async () => {
    profileServiceMocks.resolveCurrentActiveProfile.mockResolvedValue(null)

    await expect(
      listWealthSnapshotHistory(actor, {
        page: 2,
        pageSize: 10,
      }),
    ).resolves.toEqual({
      items: [],
      page: 2,
      pageSize: 10,
      hasMore: false,
    })
    expect(repositoryMocks.listWealthSnapshotHistoryRecordsByProfileId).not.toHaveBeenCalled()
  })

  it("returns append-only history for the active profile", async () => {
    profileServiceMocks.resolveCurrentActiveProfile.mockResolvedValue({
      id: "profile-1",
      madhab: "maliki",
      nisabBenchmark: "silver",
    })
    repositoryMocks.listWealthSnapshotHistoryRecordsByProfileId.mockResolvedValue({
      items: [
        {
          id: "snapshot-1",
          profileId: "profile-1",
          capturedAt: new Date("2026-05-13T00:00:00Z"),
          madhab: "maliki",
          nisabBenchmark: "silver",
          calculationVersion: fiqhCalculationVersion,
          netZakatableBase: "87.50",
          isAboveNisab: true,
          isZakatDue: false,
          createdAt: new Date("2026-05-13T00:00:00Z"),
          updatedAt: new Date("2026-05-13T00:00:00Z"),
          entries: [],
        },
        {
          id: "snapshot-2",
          profileId: "profile-1",
          capturedAt: new Date("2026-05-14T00:00:00Z"),
          madhab: "maliki",
          nisabBenchmark: "silver",
          calculationVersion: fiqhCalculationVersion,
          netZakatableBase: "120.00",
          isAboveNisab: true,
          isZakatDue: false,
          createdAt: new Date("2026-05-14T00:00:00Z"),
          updatedAt: new Date("2026-05-14T00:00:00Z"),
          entries: [],
        },
      ],
      page: 2,
      pageSize: 10,
      hasMore: false,
    })

    await expect(
      listWealthSnapshotHistory(actor, {
        page: 2,
        pageSize: 10,
      }),
    ).resolves.toEqual({
      items: [
        {
          id: "snapshot-1",
          profileId: "profile-1",
          capturedAt: new Date("2026-05-13T00:00:00Z"),
          madhab: "maliki",
          nisabBenchmark: "silver",
          calculationVersion: fiqhCalculationVersion,
          netZakatableBase: "87.50",
          isAboveNisab: true,
          isZakatDue: false,
          createdAt: new Date("2026-05-13T00:00:00Z"),
          updatedAt: new Date("2026-05-13T00:00:00Z"),
          entries: [],
        },
        {
          id: "snapshot-2",
          profileId: "profile-1",
          capturedAt: new Date("2026-05-14T00:00:00Z"),
          madhab: "maliki",
          nisabBenchmark: "silver",
          calculationVersion: fiqhCalculationVersion,
          netZakatableBase: "120.00",
          isAboveNisab: true,
          isZakatDue: false,
          createdAt: new Date("2026-05-14T00:00:00Z"),
          updatedAt: new Date("2026-05-14T00:00:00Z"),
          entries: [],
        },
      ],
      page: 2,
      pageSize: 10,
      hasMore: false,
    })
    expect(repositoryMocks.listWealthSnapshotHistoryRecordsByProfileId).toHaveBeenCalledWith(
      "profile-1",
      {
        page: 2,
        pageSize: 10,
      },
    )
  })

  it("rejects snapshot capture when no profile is active", async () => {
    profileServiceMocks.resolveCurrentActiveProfile.mockResolvedValue(null)

    await expect(
      replaceWealthSnapshot(actor, {
        entries: [{ category: "cash", amount: "100.50" }],
      }),
    ).rejects.toThrow("No active profile")

    expect(repositoryMocks.replaceWealthSnapshotRecord).not.toHaveBeenCalled()
  })

  it("returns the current snapshot for the active profile", async () => {
    profileServiceMocks.resolveCurrentActiveProfile.mockResolvedValue({
      id: "profile-1",
      madhab: "hanafi",
      nisabBenchmark: "gold",
    })
    repositoryMocks.getWealthSnapshotWithEntriesRecordByProfileId.mockResolvedValue({
      id: "snapshot-1",
      profileId: "profile-1",
      capturedAt: new Date("2026-05-13T00:00:00Z"),
      madhab: "hanafi",
      nisabBenchmark: "gold",
      calculationVersion: fiqhCalculationVersion,
      netZakatableBase: "87.50",
      isAboveNisab: true,
      isZakatDue: false,
      createdAt: new Date("2026-05-13T00:00:00Z"),
      updatedAt: new Date("2026-05-13T00:00:00Z"),
      entries: [],
    })

    await expect(getCurrentWealthSnapshot(actor)).resolves.toMatchObject({
      id: "snapshot-1",
      profileId: "profile-1",
    })
    expect(repositoryMocks.getWealthSnapshotWithEntriesRecordByProfileId).toHaveBeenCalledWith(
      "profile-1",
    )
  })

  it("returns no current snapshot when no profile is active", async () => {
    profileServiceMocks.resolveCurrentActiveProfile.mockResolvedValue(null)

    await expect(getCurrentWealthSnapshot(actor)).resolves.toBeNull()
    expect(
      repositoryMocks.getWealthSnapshotWithEntriesRecordByProfileId,
    ).not.toHaveBeenCalled()
  })
})
