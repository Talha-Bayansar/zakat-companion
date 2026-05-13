import { createFileRoute } from "@tanstack/react-router"

import { WealthSnapshotCreatePage } from "@/features/wealth-snapshot"

export const Route = createFileRoute("/app/wealth-snapshot/new/")({
  component: WealthSnapshotCreatePage,
})
