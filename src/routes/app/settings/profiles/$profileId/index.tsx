import { createFileRoute } from "@tanstack/react-router"

import { ProfileEditPage } from "@/features/profiles"

export const Route = createFileRoute("/app/settings/profiles/$profileId/")({
  component: ProfileEditRoute,
})

function ProfileEditRoute() {
  const { profileId } = Route.useParams()

  return <ProfileEditPage profileId={profileId} />
}
