import { queryOptions, useQuery } from "@tanstack/react-query"

import { getAuthSessionFn } from "../server/functions/auth-session.function"

export const authSessionQueryKey = ["auth", "session"] as const

export function authSessionQueryOptions() {
  return queryOptions({
    queryKey: authSessionQueryKey,
    queryFn: async () => getAuthSessionFn(),
    staleTime: 5 * 60 * 1000,
  })
}

export function useAuthSessionQuery() {
  return useQuery(authSessionQueryOptions())
}
