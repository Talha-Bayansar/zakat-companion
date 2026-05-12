import { createFileRoute } from "@tanstack/react-router"

import { AuthPage } from "@/features/auth"

export const Route = createFileRoute("/sign-in/")({
  validateSearch: (search: Record<string, unknown>) => ({
    redirect: typeof search.redirect === "string" ? search.redirect : undefined,
  }),
  component: SignInRoute,
})

function SignInRoute() {
  const { redirect } = Route.useSearch()

  return <AuthPage redirectTo={redirect} />
}

