import { useInfiniteQuery } from '@tanstack/react-query'
import { getAssessmentHistory } from '@/server/functions/zakat/get-assessment-history'
import { queryKeys } from '@/shared/lib/query/query-keys'

const PAGE_SIZE = 8

export function useAssessmentHistoryInfiniteQuery(userId?: string) {
  return useInfiniteQuery({
    queryKey: userId ? queryKeys.zakatAssessment.historyInfiniteByUser(userId) : queryKeys.zakatAssessment.all,
    enabled: Boolean(userId),
    initialPageParam: 0,
    queryFn: async ({ pageParam }) => {
      if (!userId) return { items: [], nextOffset: null }

      return getAssessmentHistory({
        data: {
          userId,
          offset: pageParam,
          limit: PAGE_SIZE,
        },
      })
    },
    getNextPageParam: (lastPage) => lastPage.nextOffset ?? undefined,
    staleTime: 30_000,
  })
}
