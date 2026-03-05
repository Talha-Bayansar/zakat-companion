import { useQuery } from '@tanstack/react-query'
import { getAssessmentById } from '@/server/functions/zakat/get-assessment-by-id'

export function useAssessmentByIdQuery(input: { userId?: string; assessmentId?: string }) {
  const { userId, assessmentId } = input

  return useQuery({
    queryKey: ['zakat-assessment', 'detail', userId, assessmentId],
    enabled: Boolean(userId && assessmentId),
    queryFn: async () => {
      if (!userId || !assessmentId) return null
      return getAssessmentById({ data: { userId, assessmentId } })
    },
    staleTime: 30_000,
  })
}
