import { createFileRoute } from "@tanstack/react-router"

import { ProfilesPage } from "@/features/profiles"

export const Route = createFileRoute("/app/settings/profiles/")({
  component: ProfilesRoute,
})

function ProfilesRoute() {
  return <ProfilesPage />
}
