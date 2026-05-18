import { queryOptions, useQuery } from "@tanstack/react-query"

import { useInfiniteListQuery } from "@/shared/lib/infinite-list-query"

import { listHistoryCyclesFn } from "../server/functions/history.function"
import type { HistoryCycleHistoryPage, HistoryCycleRecord } from "./history.types"

export const historyCyclesQueryKey = ["history", "cycles"] as const

export function historyCyclesInfiniteQueryKey(profileId: string | null) {
  return profileId
    ? [...historyCyclesQueryKey, profileId] as const
    : [...historyCyclesQueryKey, "none"] as const
}

export function useHistoryCyclesInfiniteQuery(profileId: string | null) {
  return useInfiniteListQuery<HistoryCycleRecord>({
    queryKey: historyCyclesInfiniteQueryKey(profileId),
    queryFn: async (request) => listHistoryCyclesFn({ data: request }),
    enabled: profileId !== null,
    pageSize: 10,
  })
}

export function historyCyclesQueryOptions(profileId: string | null) {
  return queryOptions<HistoryCycleHistoryPage>({
    queryKey: historyCyclesInfiniteQueryKey(profileId),
    queryFn: async () =>
      listHistoryCyclesFn({
        data: { page: 1, pageSize: 10 },
      }),
    enabled: profileId !== null,
  })
}

export function useHistoryCyclesQuery(profileId: string | null) {
  return useQuery(historyCyclesQueryOptions(profileId))
}

