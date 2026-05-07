import { createFileRoute } from "@tanstack/react-router"

import { HomePage } from "@/features/home"
import { AppShell } from "@/shared/layouts/app-shell"

export const Route = createFileRoute("/app/")({ component: AppRoute })

function AppRoute() {
  return (
    <AppShell>
      <HomePage />
    </AppShell>
  )
}
