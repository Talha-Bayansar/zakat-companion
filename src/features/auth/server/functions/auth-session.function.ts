import { createServerFn } from "@tanstack/react-start"
import { getRequest } from "@tanstack/react-start/server"

export type AuthSession = {
  user: {
    id: string
  }
} | null

export const getAuthSessionFn = createServerFn({ method: "GET" }).handler(
  async (): Promise<AuthSession> => {
    const { auth } = await import("@/server/auth")

    const session = await auth.api.getSession({
      headers: getRequest().headers,
    })

    return session as AuthSession
  },
)
