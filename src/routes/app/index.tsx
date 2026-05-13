import { createFileRoute } from "@tanstack/react-router"

import { WealthSnapshotPage } from "@/features/wealth-snapshot"

export const Route = createFileRoute("/app/")({
  component: AppRoute,
})

function AppRoute() {
  return <WealthSnapshotPage />
}
