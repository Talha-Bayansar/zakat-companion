import { useQuery } from '@tanstack/react-query'
import { authClient } from '@/lib/auth-client'
import { queryKeys } from '@/shared/lib/query/query-keys'

export function useCurrentUserQuery() {
  return useQuery({
    queryKey: queryKeys.user.me(),
    queryFn: async () => {
      const session = await authClient.getSession()
      return session.data?.user ?? null
    },
    staleTime: 60_000,
  })
}
