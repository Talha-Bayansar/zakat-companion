import { queryOptions, useQuery } from "@tanstack/react-query"

import {
  listAccessibleProfilesFn,
  listManagedProfileAccessFn,
} from "../server/functions/profile-access.function"

export const profileAccessQueryKey = ["profiles"] as const

export function profileAccessQueryOptions() {
  return queryOptions({
    queryKey: [...profileAccessQueryKey, "accessible"] as const,
    queryFn: async () => listAccessibleProfilesFn(),
  })
}

export function useAccessibleProfilesQuery() {
  return useQuery(profileAccessQueryOptions())
}

export function profileManagedAccessQueryKey(profileId: string) {
  return [...profileAccessQueryKey, "managed-access", profileId] as const
}

export function profileManagedAccessQueryOptions(profileId: string | null) {
  return queryOptions({
    queryKey: profileId
      ? profileManagedAccessQueryKey(profileId)
      : [...profileAccessQueryKey, "managed-access", "none"] as const,
    queryFn: async () =>
      listManagedProfileAccessFn({ data: { profileId: profileId ?? "" } }),
    enabled: profileId !== null,
  })
}

export function useManagedProfileAccessQuery(profileId: string | null) {
  return useQuery(profileManagedAccessQueryOptions(profileId))
}
