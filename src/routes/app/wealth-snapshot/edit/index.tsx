import { createFileRoute } from "@tanstack/react-router"

import { WealthSnapshotEditPage } from "@/features/wealth-snapshot"

export const Route = createFileRoute("/app/wealth-snapshot/edit/")({
  component: WealthSnapshotEditRoute,
})

function WealthSnapshotEditRoute() {
  return <WealthSnapshotEditPage />
}
