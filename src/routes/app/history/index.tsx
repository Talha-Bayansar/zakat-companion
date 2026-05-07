import { createFileRoute } from "@tanstack/react-router"

import { HistoryPage } from "@/features/history"
import { AppShell } from "@/shared/layouts/app-shell"

export const Route = createFileRoute("/app/history/")({
  component: HistoryRoute,
})

function HistoryRoute() {
  return (
    <AppShell>
      <HistoryPage />
    </AppShell>
  )
}
