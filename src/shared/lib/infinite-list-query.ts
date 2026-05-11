import {
  keepPreviousData,
  useInfiniteQuery,
  type QueryKey,
} from "@tanstack/react-query"

import {
  clampInfiniteListPageSize,
  type InfiniteListPage,
  type InfiniteListRequest,
} from "./infinite-list"

export type InfiniteListQueryFn<TItem> = (
  request: InfiniteListRequest,
) => Promise<InfiniteListPage<TItem>>

export function useInfiniteListQuery<TItem>({
  queryKey,
  queryFn,
  search = "",
  pageSize,
  defaultPageSize,
  maxPageSize,
  enabled = true,
}: {
  queryKey: QueryKey
  queryFn: InfiniteListQueryFn<TItem>
  search?: string
  pageSize?: number
  defaultPageSize?: number
  maxPageSize?: number
  enabled?: boolean
}) {
  const normalizedPageSize = clampInfiniteListPageSize(pageSize, {
    defaultPageSize,
    maxPageSize,
  })
  const normalizedSearch = search.trim()

  return useInfiniteQuery({
    queryKey: [
      ...queryKey,
      {
        search: normalizedSearch,
        pageSize: normalizedPageSize,
      },
    ] as const,
    placeholderData: keepPreviousData,
    initialPageParam: 1,
    enabled,
    queryFn: ({ pageParam }) =>
      queryFn({
        page: pageParam ?? 1,
        pageSize: normalizedPageSize,
        search: normalizedSearch,
      }),
    getNextPageParam: (lastPage) =>
      lastPage.hasMore ? lastPage.page + 1 : undefined,
  })
}
