import { createFileRoute } from "@tanstack/react-router"

import { SettingsPage } from "@/features/settings"

export const Route = createFileRoute("/app/settings/")({
  component: SettingsRoute,
})

function SettingsRoute() {
  return <SettingsPage />
}
