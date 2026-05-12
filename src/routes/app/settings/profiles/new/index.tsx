import { createFileRoute } from "@tanstack/react-router"

import { ProfileCreatePage } from "@/features/profiles"

export const Route = createFileRoute("/app/settings/profiles/new/")({
  validateSearch: (search: Record<string, unknown>) => ({
    redirect: typeof search.redirect === "string" ? search.redirect : undefined,
  }),
  component: ProfileCreateRoute,
})

function ProfileCreateRoute() {
  const { redirect } = Route.useSearch()

  return <ProfileCreatePage redirectTo={redirect} />
}
