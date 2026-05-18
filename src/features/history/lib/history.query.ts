import { useInfiniteListQuery } from "@/shared/lib/infinite-list-query"

import { listHistoryCyclesFn } from "../server/functions/history.function"
import type { HistoryCycleRecord } from "./history.types"

export const historyCyclesQueryKey = ["history", "cycles"] as const
export const historyCyclesPageSize = 10

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
    pageSize: historyCyclesPageSize,
  })
}
