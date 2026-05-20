import { useMutation, useQueryClient } from "@tanstack/react-query"

import { authClient } from "@/lib/auth-client"
import { profileAccessQueryKey } from "@/features/profiles/lib/profile-access.query"

import { authSessionQueryKey } from "./auth-session.query"

function invalidateAuthScopedQueries(
  queryClient: ReturnType<typeof useQueryClient>,
) {
  return Promise.all([
    queryClient.invalidateQueries({
      queryKey: authSessionQueryKey,
    }),
    queryClient.invalidateQueries({
      queryKey: profileAccessQueryKey,
    }),
  ])
}

export function useGoogleSignInMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (callbackURL?: string) => {
      const result = await authClient.signIn.social({
        provider: "google",
        callbackURL: callbackURL || "/app",
      })

      if (result?.error) {
        throw new Error()
      }

      return result?.data
    },
    onSuccess: async () => {
      await invalidateAuthScopedQueries(queryClient)
    },
  })
}

export function useSignOutMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async () => {
      const result = await authClient.signOut()

      if (result.error) {
        throw new Error()
      }

      return result.data
    },
    onSuccess: async () => {
      await invalidateAuthScopedQueries(queryClient)
    },
  })
}
