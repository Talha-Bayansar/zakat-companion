import { queryOptions, useQuery } from "@tanstack/react-query"
import { createServerFn } from "@tanstack/react-start"
import { getRequest } from "@tanstack/react-start/server"

import { auth } from "@/server/auth"

export type AuthSession = typeof auth.$Infer.Session | null

export const authSessionQueryKey = ["auth", "session"] as const

const getAuthSession = createServerFn({ method: "GET" }).handler(
  async (): Promise<AuthSession> => {
    const session = await auth.api.getSession({
      headers: getRequest().headers,
    })

    return session as AuthSession
  },
)

export function authSessionQueryOptions() {
  return queryOptions({
    queryKey: authSessionQueryKey,
    queryFn: async () => getAuthSession(),
    staleTime: 5 * 60 * 1000,
  })
}

export function useAuthSessionQuery() {
  return useQuery(authSessionQueryOptions())
}
