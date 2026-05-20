import { beforeEach, describe, expect, it, vi } from "vitest"

const mocks = vi.hoisted(() => ({
  useMutation: vi.fn(),
  useQueryClient: vi.fn(),
  invalidateQueries: vi.fn(),
  getQueryData: vi.fn(),
  setQueryData: vi.fn(),
  createProfileFn: vi.fn(),
  deleteProfileFn: vi.fn(),
  grantProfileAccessFn: vi.fn(),
  revokeProfileAccessFn: vi.fn(),
  updateProfileFn: vi.fn(),
  switchActiveProfileFn: vi.fn(),
}))

vi.mock("@tanstack/react-query", () => ({
  useMutation: mocks.useMutation,
  useQueryClient: mocks.useQueryClient,
}))

vi.mock("../server/functions/profile-access.function", () => ({
  createProfileFn: mocks.createProfileFn,
  deleteProfileFn: mocks.deleteProfileFn,
  grantProfileAccessFn: mocks.grantProfileAccessFn,
  revokeProfileAccessFn: mocks.revokeProfileAccessFn,
  updateProfileFn: mocks.updateProfileFn,
  switchActiveProfileFn: mocks.switchActiveProfileFn,
}))

import { authSessionQueryKey } from "@/features/auth/lib/auth-session.query"
import { historyCyclesQueryKey } from "@/features/history/lib/history.query"
import {
  wealthSnapshotHistoryQueryKey,
  wealthSnapshotQueryKey,
} from "@/features/wealth-snapshot"

import { profileAccessQueryKey, profileCurrentActiveQueryKey } from "./profile-access.query"
import {
  useCreateProfileMutation,
  useDeleteProfileMutation,
  useUpdateProfileMutation,
  useSwitchActiveProfileMutation,
} from "./profile-access.mutations"

const createdProfile = {
  id: "profile-1",
  name: "Family",
  ownerId: "user-1",
  hawlStartedAt: new Date("2026-05-01T00:00:00Z"),
  madhab: "hanafi",
  nisabBenchmark: "gold",
  role: "owner",
  canManageAccess: true,
  accessGrantedAt: null,
  grantedByUserId: null,
  createdAt: new Date("2026-05-01T00:00:00Z"),
  updatedAt: new Date("2026-05-01T00:00:00Z"),
}

const fallbackActiveProfile = {
  id: "profile-2",
  name: "Household",
  ownerId: "user-1",
  hawlStartedAt: new Date("2026-05-02T00:00:00Z"),
  madhab: "maliki",
  nisabBenchmark: "silver",
  role: "owner",
  canManageAccess: true,
  accessGrantedAt: null,
  grantedByUserId: null,
  createdAt: new Date("2026-05-02T00:00:00Z"),
  updatedAt: new Date("2026-05-02T00:00:00Z"),
}

describe("profile access mutations", () => {
  const queryClient = {
    invalidateQueries: mocks.invalidateQueries,
    getQueryData: mocks.getQueryData,
    setQueryData: mocks.setQueryData,
  }

  beforeEach(() => {
    vi.clearAllMocks()
    mocks.useQueryClient.mockReturnValue(queryClient)
    mocks.useMutation.mockImplementation((options) => ({ options }))
  })

  it("syncs the active profile cache immediately after switching profiles", async () => {
    useSwitchActiveProfileMutation()
    const options = mocks.useMutation.mock.calls.at(0)?.[0]

    await options.onSuccess?.(createdProfile)

    expect(mocks.setQueryData).toHaveBeenCalledWith(
      profileCurrentActiveQueryKey,
      createdProfile,
    )
    expect(mocks.invalidateQueries).toHaveBeenNthCalledWith(1, {
      queryKey: profileAccessQueryKey,
    })
    expect(mocks.invalidateQueries).toHaveBeenNthCalledWith(2, {
      queryKey: profileCurrentActiveQueryKey,
    })
    expect(mocks.invalidateQueries).toHaveBeenNthCalledWith(3, {
      queryKey: authSessionQueryKey,
    })
  })

  it("seeds the active profile cache when creating the first profile", async () => {
    useCreateProfileMutation()
    const options = mocks.useMutation.mock.calls.at(0)?.[0]

    await options.onSuccess?.({
      profile: createdProfile,
      activeProfile: createdProfile,
    })

    expect(mocks.setQueryData).toHaveBeenCalledWith(
      profileCurrentActiveQueryKey,
      createdProfile,
    )
    expect(mocks.invalidateQueries).toHaveBeenCalledWith({
      queryKey: profileAccessQueryKey,
    })
  })

  it("keeps the active profile cache aligned with the active selection when creating a new profile", async () => {
    useCreateProfileMutation()
    const options = mocks.useMutation.mock.calls.at(0)?.[0]

    await options.onSuccess?.({
      profile: createdProfile,
      activeProfile: fallbackActiveProfile,
    })

    expect(mocks.setQueryData).not.toHaveBeenCalledWith(
      profileCurrentActiveQueryKey,
      createdProfile,
    )
    expect(mocks.setQueryData).toHaveBeenCalledWith(
      profileCurrentActiveQueryKey,
      fallbackActiveProfile,
    )
    expect(mocks.invalidateQueries).toHaveBeenCalledWith({
      queryKey: profileAccessQueryKey,
    })
  })

  it("invalidates derived lifecycle queries after updating a profile", async () => {
    useUpdateProfileMutation()
    const options = mocks.useMutation.mock.calls.at(0)?.[0]

    mocks.getQueryData.mockReturnValue({
      ...createdProfile,
      id: "profile-1",
    })

    await options.onSuccess?.({
      ...createdProfile,
      id: "profile-1",
      name: "Family",
      madhab: "maliki",
      nisabBenchmark: "silver",
    })

    expect(mocks.invalidateQueries).toHaveBeenCalledWith({
      queryKey: wealthSnapshotQueryKey,
    })
    expect(mocks.invalidateQueries).toHaveBeenCalledWith({
      queryKey: wealthSnapshotHistoryQueryKey,
    })
    expect(mocks.invalidateQueries).toHaveBeenCalledWith({
      queryKey: historyCyclesQueryKey,
    })
  })

  it("restores the next active profile after deleting the current one", async () => {
    useDeleteProfileMutation()
    const options = mocks.useMutation.mock.calls.at(0)?.[0]

    await options.onSuccess?.({
      deleted: true,
      activeProfile: fallbackActiveProfile,
    })

    expect(mocks.setQueryData).toHaveBeenCalledWith(
      profileCurrentActiveQueryKey,
      fallbackActiveProfile,
    )
    expect(mocks.invalidateQueries).toHaveBeenCalledWith({
      queryKey: profileAccessQueryKey,
    })
  })
})
