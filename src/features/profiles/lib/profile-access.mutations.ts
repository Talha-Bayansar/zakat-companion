import { useMutation, useQueryClient } from "@tanstack/react-query"

import {
  createProfileFn,
  deleteProfileFn,
  grantProfileAccessFn,
  revokeProfileAccessFn,
  updateProfileFn,
  switchActiveProfileFn,
} from "../server/functions/profile-access.function"
import type { CreateProfileValues } from "./profile-access.schemas"
import {
  profileAccessQueryKey,
  profileCurrentActiveQueryKey,
} from "./profile-access.query"
import { authSessionQueryKey } from "@/features/auth/lib/auth-session.query"

function invalidateProfileQueries(queryClient: ReturnType<typeof useQueryClient>) {
  const invalidateProfileSelectionQueries = queryClient.invalidateQueries({
    queryKey: profileAccessQueryKey,
  })

  const invalidateCurrentActiveProfileQuery = queryClient.invalidateQueries({
    queryKey: profileCurrentActiveQueryKey,
  })

  const invalidateAuthSessionQuery = queryClient.invalidateQueries({
    queryKey: authSessionQueryKey,
  })

  return Promise.all([
    invalidateProfileSelectionQueries,
    invalidateCurrentActiveProfileQuery,
    invalidateAuthSessionQuery,
  ])
}

export function useCreateProfileMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (values: CreateProfileValues) =>
      createProfileFn({ data: values }),
    onSuccess: async () => {
      await invalidateProfileQueries(queryClient)
    },
  })
}

export function useUpdateProfileMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (values: {
      profileId: string
      name: string
    }) => updateProfileFn({ data: values }),
    onSuccess: async () => {
      await invalidateProfileQueries(queryClient)
    },
  })
}

export function useSwitchActiveProfileMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (profileId: string) =>
      switchActiveProfileFn({ data: { profileId } }),
    onSuccess: async () => {
      await invalidateProfileQueries(queryClient)
    },
  })
}

export function useGrantProfileAccessMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (values: {
      profileId: string
      email: string
    }) => grantProfileAccessFn({ data: values }),
    onSuccess: async () => {
      await invalidateProfileQueries(queryClient)
    },
  })
}

export function useRevokeProfileAccessMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (values: {
      profileId: string
      email: string
    }) => revokeProfileAccessFn({ data: values }),
    onSuccess: async () => {
      await invalidateProfileQueries(queryClient)
    },
  })
}

export function useDeleteProfileMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (profileId: string) =>
      deleteProfileFn({ data: { profileId } }),
    onSuccess: async () => {
      await invalidateProfileQueries(queryClient)
    },
  })
}
