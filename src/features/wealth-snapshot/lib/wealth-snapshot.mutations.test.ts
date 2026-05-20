import { beforeEach, describe, expect, it, vi } from "vitest"

const mocks = vi.hoisted(() => ({
  useMutation: vi.fn(),
  useQueryClient: vi.fn(),
  invalidateQueries: vi.fn(),
  replaceWealthSnapshotFn: vi.fn(),
  refreshWealthSnapshotFn: vi.fn(),
}))

vi.mock("@tanstack/react-query", () => ({
  useMutation: mocks.useMutation,
  useQueryClient: mocks.useQueryClient,
}))

vi.mock("../server/functions/wealth-snapshot.function", () => ({
  replaceWealthSnapshotFn: mocks.replaceWealthSnapshotFn,
  refreshWealthSnapshotFn: mocks.refreshWealthSnapshotFn,
}))

import { currentBenchmarkPricingQueryKey } from "@/features/benchmark-pricing"
import { historyCyclesQueryKey } from "@/features/history/lib/history.query"
import {
  wealthSnapshotHistoryQueryKey,
  wealthSnapshotQueryKey,
} from "./wealth-snapshot.query"
import {
  useRefreshWealthSnapshotMutation,
  useReplaceWealthSnapshotMutation,
} from "./wealth-snapshot.mutations"

describe("wealth snapshot mutations", () => {
  const queryClient = {
    invalidateQueries: mocks.invalidateQueries,
  }

  beforeEach(() => {
    vi.clearAllMocks()
    mocks.useQueryClient.mockReturnValue(queryClient)
    mocks.useMutation.mockImplementation((options) => ({ options }))
  })

  it("invalidates benchmark pricing after replacing the current snapshot", async () => {
    useReplaceWealthSnapshotMutation()
    const options = mocks.useMutation.mock.calls.at(0)?.[0]

    await options.onSuccess?.()

    expect(mocks.invalidateQueries).toHaveBeenNthCalledWith(1, {
      queryKey: wealthSnapshotQueryKey,
    })
    expect(mocks.invalidateQueries).toHaveBeenNthCalledWith(2, {
      queryKey: wealthSnapshotHistoryQueryKey,
    })
    expect(mocks.invalidateQueries).toHaveBeenNthCalledWith(3, {
      queryKey: currentBenchmarkPricingQueryKey,
    })
    expect(mocks.invalidateQueries).toHaveBeenNthCalledWith(4, {
      queryKey: historyCyclesQueryKey,
    })
  })

  it("invalidates benchmark pricing after refreshing the current snapshot", async () => {
    useRefreshWealthSnapshotMutation()
    const options = mocks.useMutation.mock.calls.at(0)?.[0]

    await options.onSuccess?.()

    expect(mocks.invalidateQueries).toHaveBeenNthCalledWith(1, {
      queryKey: wealthSnapshotQueryKey,
    })
    expect(mocks.invalidateQueries).toHaveBeenNthCalledWith(2, {
      queryKey: wealthSnapshotHistoryQueryKey,
    })
    expect(mocks.invalidateQueries).toHaveBeenNthCalledWith(3, {
      queryKey: currentBenchmarkPricingQueryKey,
    })
    expect(mocks.invalidateQueries).toHaveBeenNthCalledWith(4, {
      queryKey: historyCyclesQueryKey,
    })
  })
})
