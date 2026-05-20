// @vitest-environment jsdom

import { beforeEach, describe, expect, it, vi } from "vitest"
import { render, screen } from "@testing-library/react"

import { m } from "@/paraglide/messages"

const mocks = vi.hoisted(() => ({
  useCurrentActiveProfileQuery: vi.fn(),
  useWealthSnapshotQuery: vi.fn(),
  useHistoryCyclesInfiniteQuery: vi.fn(),
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

vi.mock("@/features/wealth-snapshot", () => ({
  useWealthSnapshotQuery: mocks.useWealthSnapshotQuery,
}))

vi.mock("@/features/history", () => ({
  useHistoryCyclesInfiniteQuery: mocks.useHistoryCyclesInfiniteQuery,
}))

import { HomePage } from "./home.page"

const activeCycle = {
  id: "cycle-1",
  profileId: "profile-1",
  sourceSnapshotId: "snapshot-1",
  state: "due",
  dueAt: new Date("2026-05-20T09:00:00.000Z"),
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
  mocks.useWealthSnapshotQuery.mockReturnValue({
    data: {
      capturedAt: new Date("2026-05-15T09:00:00.000Z"),
      isAboveNisab: true,
    },
    isLoading: false,
  })
  mocks.useHistoryCyclesInfiniteQuery.mockReturnValue({
    data: {
      pages: [
        {
          items: [],
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
})

describe("HomePage", () => {
  it("shows the empty state when no active profile is selected", () => {
    mocks.useCurrentActiveProfileQuery.mockReturnValue({
      data: null,
      isLoading: false,
    })

    render(<HomePage />)

    expect(screen.getByText(m.history_no_active_profile_title())).toBeDefined()
    expect(
      (screen.getByRole("link", { name: m.nav_settings_label() }) as HTMLAnchorElement).getAttribute("href"),
    ).toBe("/app/settings")
  })

  it("shows the below-nisab state when the latest snapshot is below nisab and there is no active cycle", () => {
    mocks.useWealthSnapshotQuery.mockReturnValue({
      data: {
        capturedAt: new Date("2026-05-15T09:00:00.000Z"),
        isAboveNisab: false,
      },
      isLoading: false,
    })

    render(<HomePage />)

    expect(screen.getByText(m.cycle_status_below_nisab_title())).toBeDefined()
    expect(
      screen.getByText(m.cycle_status_below_nisab_description()),
    ).toBeDefined()
  })

  it("shows the paid state when the latest cycle is already settled", () => {
    mocks.useHistoryCyclesInfiniteQuery.mockReturnValue({
      data: {
        pages: [
          {
            items: [{ ...activeCycle, id: "cycle-0", state: "paid" }, activeCycle],
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

    render(<HomePage />)

    expect(screen.getByText(m.cycle_status_paid_title())).toBeDefined()
    expect(screen.getByText(m.cycle_status_paid_description())).toBeDefined()
    expect(
      (screen.getByRole("link", { name: m.nav_history_label() }) as HTMLAnchorElement).getAttribute("href"),
    ).toBe("/app/history")
  })
})
