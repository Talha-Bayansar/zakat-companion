import { createFileRoute } from "@tanstack/react-router"

import { ProfileCreatePage } from "@/features/profiles"

export const Route = createFileRoute("/app/settings/profiles/new/")({
  component: ProfileCreateRoute,
})

function ProfileCreateRoute() {
  return <ProfileCreatePage />
}
