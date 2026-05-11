import { queryOptions, useQuery } from "@tanstack/react-query"

import { useInfiniteListQuery } from "@/shared/lib/infinite-list-query"

import {
  getAccessibleProfileFn,
  listAccessibleProfilesFn,
  listAccessibleProfilesPageFn,
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

export function profileAccessibleProfileQueryKey(profileId: string) {
  return [...profileAccessQueryKey, "accessible", profileId] as const
}

export function profileAccessibleProfileQueryOptions(profileId: string | null) {
  return queryOptions({
    queryKey: profileId
      ? profileAccessibleProfileQueryKey(profileId)
      : [...profileAccessQueryKey, "accessible", "none"] as const,
    queryFn: async () => getAccessibleProfileFn({ data: { profileId: profileId ?? "" } }),
    enabled: profileId !== null,
  })
}

export function useAccessibleProfileQuery(profileId: string | null) {
  return useQuery(profileAccessibleProfileQueryOptions(profileId))
}

export function profileAccessibleProfilesInfiniteQueryKey() {
  return [...profileAccessQueryKey, "accessible", "infinite"] as const
}

export function useAccessibleProfilesInfiniteQuery(search = "") {
  return useInfiniteListQuery({
    queryKey: profileAccessibleProfilesInfiniteQueryKey(),
    queryFn: async (request) => listAccessibleProfilesPageFn({ data: request }),
    search,
    pageSize: 20,
  })
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
