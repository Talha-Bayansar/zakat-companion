import { beforeEach, describe, expect, it, vi } from "vitest"

const mocks = vi.hoisted(() => ({
  useMutation: vi.fn(),
  useQueryClient: vi.fn(),
  invalidateQueries: vi.fn(),
  authClient: {
    signIn: {
      social: vi.fn(),
    },
    signOut: vi.fn(),
  },
}))

vi.mock("@tanstack/react-query", () => ({
  useMutation: mocks.useMutation,
  useQueryClient: mocks.useQueryClient,
}))

vi.mock("@/lib/auth-client", () => ({
  authClient: mocks.authClient,
}))

import { authSessionQueryKey } from "./auth-session.query"
import { profileAccessQueryKey } from "@/features/profiles/lib/profile-access.query"
import {
  useGoogleSignInMutation,
  useSignOutMutation,
} from "./auth.mutations"

describe("auth mutations", () => {
  const queryClient = {
    invalidateQueries: mocks.invalidateQueries,
  }

  beforeEach(() => {
    vi.clearAllMocks()
    mocks.useQueryClient.mockReturnValue(queryClient)
    mocks.useMutation.mockImplementation((options) => ({ options }))
  })

  it("invalidates auth and profile caches after Google sign-in", async () => {
    useGoogleSignInMutation()
    const options = mocks.useMutation.mock.calls.at(0)?.[0]

    await options.onSuccess?.()

    expect(mocks.invalidateQueries).toHaveBeenNthCalledWith(1, {
      queryKey: authSessionQueryKey,
    })
    expect(mocks.invalidateQueries).toHaveBeenNthCalledWith(2, {
      queryKey: profileAccessQueryKey,
    })
  })

  it("invalidates auth and profile caches after sign-out", async () => {
    useSignOutMutation()
    const options = mocks.useMutation.mock.calls.at(0)?.[0]

    await options.onSuccess?.()

    expect(mocks.invalidateQueries).toHaveBeenNthCalledWith(1, {
      queryKey: authSessionQueryKey,
    })
    expect(mocks.invalidateQueries).toHaveBeenNthCalledWith(2, {
      queryKey: profileAccessQueryKey,
    })
  })
})
