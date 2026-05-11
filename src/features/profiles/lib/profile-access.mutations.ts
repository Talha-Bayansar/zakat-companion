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
import { profileAccessQueryKey } from "./profile-access.query"

function invalidateProfileQueries(queryClient: ReturnType<typeof useQueryClient>) {
  return queryClient.invalidateQueries({
    queryKey: profileAccessQueryKey,
  })
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
