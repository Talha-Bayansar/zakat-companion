import { m } from "@/paraglide/messages"

import { useCurrentActiveProfileQuery } from "@/features/profiles"
import { useHistoryCyclesInfiniteQuery } from "@/features/history"
import { useWealthSnapshotQuery } from "@/features/wealth-snapshot"
import { PageHeader, PageSection } from "@/shared/ui/page"

import { CurrentCyclePanel } from "../components/current-cycle-panel"

export function HomePage() {
  const activeProfileQuery = useCurrentActiveProfileQuery()
  const activeProfileId = activeProfileQuery.data?.id ?? null
  const currentSnapshotQuery = useWealthSnapshotQuery(activeProfileId)
  const currentSnapshot = currentSnapshotQuery.data
  const historyQuery = useHistoryCyclesInfiniteQuery(activeProfileId)
  const cycles = historyQuery.data?.pages.flatMap((page) => page.items) ?? []
  const latestCycle = cycles[0] ?? null
  const isActiveProfileLoading =
    activeProfileQuery.isLoading && activeProfileId === null

  return (
    <PageSection className="gap-6">
      <PageHeader
        eyebrow={m.home_eyebrow()}
        title={m.home_title()}
        description={m.home_description()}
      />

      <CurrentCyclePanel
        activeProfileId={activeProfileId}
        isActiveProfileLoading={isActiveProfileLoading}
        currentSnapshot={currentSnapshot}
        isCurrentSnapshotLoading={currentSnapshotQuery.isLoading}
        latestCycle={latestCycle}
        isHistoryLoading={historyQuery.isLoading}
      />
    </PageSection>
  )
}
