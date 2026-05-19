// @vitest-environment jsdom

import { beforeEach, describe, expect, it, vi } from "vitest"
import { fireEvent, render, screen, waitFor } from "@testing-library/react"

import { m } from "@/paraglide/messages"

const mocks = vi.hoisted(() => ({
  useCurrentActiveProfileQuery: vi.fn(),
  useHistoryCyclesInfiniteQuery: vi.fn(),
  useMarkCyclePaidMutation: vi.fn(),
  mutateAsync: vi.fn(),
}))

vi.mock("@tanstack/react-router", () => ({
  Link: ({ children, to, ...props }: any) => (
    <a href={typeof to === "string" ? to : ""} {...props}>
      {children}
    </a>
  ),
}))

vi.mock("@/features/profiles", () => ({
  useCurrentActiveProfileQuery: mocks.useCurrentActiveProfileQuery,
}))

vi.mock("../lib/history.query", () => ({
  useHistoryCyclesInfiniteQuery: mocks.useHistoryCyclesInfiniteQuery,
}))

vi.mock("../lib/history.mutations", () => ({
  useMarkCyclePaidMutation: mocks.useMarkCyclePaidMutation,
}))

import { HistoryPage } from "./history.page"

const unpaidCycle = {
  id: "cycle-1",
  profileId: "profile-1",
  sourceSnapshotId: null,
  state: "due",
  dueAt: new Date("2026-05-16T09:00:00.000Z"),
  paidAt: null,
  createdAt: new Date("2026-05-15T09:00:00.000Z"),
  updatedAt: new Date("2026-05-15T09:00:00.000Z"),
  sourceSnapshot: null,
}

beforeEach(() => {
  vi.clearAllMocks()
  mocks.useCurrentActiveProfileQuery.mockReturnValue({
    data: { id: "profile-1" },
    isLoading: false,
  })
  mocks.useHistoryCyclesInfiniteQuery.mockReturnValue({
    data: {
      pages: [
        {
          items: [unpaidCycle],
          page: 1,
          pageSize: 10,
          hasMore: false,
        },
      ],
    },
    isLoading: false,
    isError: false,
    hasNextPage: false,
    isFetchingNextPage: false,
    fetchNextPage: vi.fn(),
    error: null,
  })
  mocks.useMarkCyclePaidMutation.mockReturnValue({
    mutateAsync: mocks.mutateAsync,
    isPending: false,
  })
  mocks.mutateAsync.mockResolvedValue(undefined)
})

describe("HistoryPage", () => {
  it("shows the loading state while the active profile and history are loading", () => {
    mocks.useCurrentActiveProfileQuery.mockReturnValue({
      data: null,
      isLoading: true,
    })
    mocks.useHistoryCyclesInfiniteQuery.mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
      hasNextPage: false,
      isFetchingNextPage: false,
      fetchNextPage: vi.fn(),
      error: null,
    })

    const { container } = render(<HistoryPage />)

    expect(container.querySelectorAll('[data-slot="skeleton"]')).toHaveLength(3)
    expect(screen.queryByText(m.history_no_active_profile_title())).toBeNull()
  })

  it("shows the empty state when no active profile is selected", () => {
    mocks.useCurrentActiveProfileQuery.mockReturnValue({
      data: null,
      isLoading: false,
    })
    mocks.useHistoryCyclesInfiniteQuery.mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: false,
      hasNextPage: false,
      isFetchingNextPage: false,
      fetchNextPage: vi.fn(),
      error: null,
    })

    render(<HistoryPage />)

    expect(screen.getByText(m.history_no_active_profile_title())).toBeDefined()
    expect(screen.getByText(m.history_no_active_profile_description())).toBeDefined()
    expect(
      (screen.getByRole("link", { name: m.nav_settings_label() }) as HTMLAnchorElement).getAttribute("href"),
    ).toBe("/app/settings")
  })

  it("submits cycle payments and shows a translated fallback error", async () => {
    mocks.mutateAsync.mockRejectedValue(new Error(""))

    render(<HistoryPage />)

    fireEvent.click(
      screen.getByRole("button", { name: m.history_cycle_mark_paid() }),
    )

    await waitFor(() => {
      expect(mocks.mutateAsync).toHaveBeenCalledWith("cycle-1")
    })
    expect(await screen.findByText(m.history_mark_cycle_paid_error())).toBeDefined()
  })
})
