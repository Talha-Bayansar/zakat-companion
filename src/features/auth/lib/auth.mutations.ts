import { useMutation, useQueryClient } from "@tanstack/react-query"

import { authClient } from "@/lib/auth-client"

import { authSessionQueryKey } from "./auth-session.query"

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
      await queryClient.invalidateQueries({
        queryKey: authSessionQueryKey,
      })
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
      await queryClient.invalidateQueries({
        queryKey: authSessionQueryKey,
      })
    },
  })
}
