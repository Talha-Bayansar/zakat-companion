import { useMutation, useQueryClient } from "@tanstack/react-query"

import { authClient } from "@/lib/auth-client"
import { m } from "@/paraglide/messages"

import { authSessionQueryKey } from "./auth-session.query"
import { type SignInValues, type SignUpValues } from "./auth.schemas"

function nameFromEmail(email: string) {
  const prefix = email.split("@")[0]?.trim() || email.trim()
  if (!prefix) {
    return m.auth_default_account_name()
  }

  return prefix
    .replace(/[._-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (character) => character.toUpperCase())
}

export function useSignInMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (values: SignInValues) => {
      const result = await authClient.signIn.email({
        email: values.email,
        password: values.password,
      })

      if (result.error) {
        throw new Error()
      }
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: authSessionQueryKey,
      })
    },
  })
}

export function useSignUpMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (values: SignUpValues) => {
      const result = await authClient.signUp.email({
        email: values.email,
        password: values.password,
        name: nameFromEmail(values.email),
      })

      if (result.error) {
        throw new Error()
      }
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
