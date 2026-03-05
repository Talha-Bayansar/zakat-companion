import { useMutation, useQueryClient } from '@tanstack/react-query'
import { saveAssessment } from '@/server/functions/zakat/save-assessment'
import { queryKeys } from '@/shared/lib/query/query-keys'

type SaveAssessmentInput = {
  userId: string
  values: {
    cash: string
    gold: string
    silver: string
    investments: string
    businessAssets: string
    receivables: string
    debtsDue: string
    otherLiabilities: string
    nisab: string
  }
}

export function useSaveAssessmentMutation(userId?: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (payload: SaveAssessmentInput) => saveAssessment({ data: payload }),
    onSuccess: async () => {
      if (!userId) return
      await queryClient.invalidateQueries({ queryKey: queryKeys.zakatAssessment.historyInfiniteByUser(userId) })
    },
  })
}
