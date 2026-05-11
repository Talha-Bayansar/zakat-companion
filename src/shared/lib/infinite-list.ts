export const DEFAULT_INFINITE_LIST_PAGE_SIZE = 20
export const MAX_INFINITE_LIST_PAGE_SIZE = 100

export type InfiniteListRequest = {
  page: number
  pageSize: number
  search: string
}

export type InfiniteListPage<TItem> = {
  items: TItem[]
  page: number
  pageSize: number
  hasMore: boolean
}

export function clampInfiniteListPageSize(
  pageSize: number | null | undefined,
  options?: {
    defaultPageSize?: number
    maxPageSize?: number
  },
) {
  const defaultPageSize =
    options?.defaultPageSize ?? DEFAULT_INFINITE_LIST_PAGE_SIZE
  const maxPageSize = options?.maxPageSize ?? MAX_INFINITE_LIST_PAGE_SIZE
  const normalizedPageSize =
    typeof pageSize === "number" && Number.isFinite(pageSize)
      ? Math.floor(pageSize)
      : defaultPageSize

  return Math.min(Math.max(normalizedPageSize, 1), maxPageSize)
}
