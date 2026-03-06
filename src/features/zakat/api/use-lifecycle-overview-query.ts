import { useQuery } from '@tanstack/react-query'
import { getLifecycleOverview } from '@/server/functions/zakat/get-lifecycle-overview'
import { queryKeys } from '@/shared/lib/query/query-keys'

export function useLifecycleOverviewQuery(userId?: string) {
  return useQuery({
    queryKey: userId ? queryKeys.zakatAssessment.lifecycleByUser(userId) : queryKeys.zakatAssessment.all,
    enabled: Boolean(userId),
    queryFn: async () => {
      if (!userId) {
        return {
          currentNisabState: 'BELOW' as const,
          hasActiveCycle: false,
          activeCycle: null,
          timeline: [],
        }
      }

      return getLifecycleOverview({ data: { userId } })
    },
    staleTime: 30_000,
  })
}
