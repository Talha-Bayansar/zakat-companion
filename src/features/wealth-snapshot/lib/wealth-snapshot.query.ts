import { queryOptions, useQuery } from "@tanstack/react-query"

import { useInfiniteListQuery } from "@/shared/lib/infinite-list-query"

import {
  getCurrentWealthSnapshotFn,
  listWealthSnapshotHistoryFn,
} from "../server/functions/wealth-snapshot.function"
import type {
  WealthSnapshotRecord,
} from "./wealth-snapshot.types"

export const wealthSnapshotQueryKey = ["wealth-snapshot"] as const
export const wealthSnapshotHistoryQueryKey = [
  "wealth-snapshot",
  "history",
] as const

export function wealthSnapshotQueryOptions(profileId: string | null) {
  return queryOptions<WealthSnapshotRecord | null>({
    queryKey: profileId
      ? [...wealthSnapshotQueryKey, profileId] as const
      : [...wealthSnapshotQueryKey, "none"] as const,
    queryFn: async () => getCurrentWealthSnapshotFn(),
    enabled: profileId !== null,
  })
}

export function useWealthSnapshotQuery(profileId: string | null) {
  return useQuery(wealthSnapshotQueryOptions(profileId))
}

export function useWealthSnapshotHistoryInfiniteQuery(
  profileId: string | null,
) {
  return useInfiniteListQuery<WealthSnapshotRecord>({
    queryKey: profileId
      ? [...wealthSnapshotHistoryQueryKey, profileId] as const
      : [...wealthSnapshotHistoryQueryKey, "none"] as const,
    queryFn: async (request) => listWealthSnapshotHistoryFn({ data: request }),
    enabled: profileId !== null,
    pageSize: 10,
  })
}
