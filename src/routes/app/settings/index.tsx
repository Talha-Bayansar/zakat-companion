import { createFileRoute } from "@tanstack/react-router"

import { SettingsPage } from "@/features/settings"
import { AppShell } from "@/shared/layouts/app-shell"

export const Route = createFileRoute("/app/settings/")({
  component: SettingsRoute,
})

function SettingsRoute() {
  return (
    <AppShell>
      <SettingsPage />
    </AppShell>
  )
}
