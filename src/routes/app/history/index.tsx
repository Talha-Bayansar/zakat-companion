import { createFileRoute } from "@tanstack/react-router"

import { HistoryPage } from "@/features/history"

export const Route = createFileRoute("/app/history/")({
  component: HistoryRoute,
})

function HistoryRoute() {
  return <HistoryPage />
}
