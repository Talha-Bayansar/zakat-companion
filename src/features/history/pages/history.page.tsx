import { useState } from "react"
import { Link } from "@tanstack/react-router"

import { m } from "@/paraglide/messages"

import { useCurrentActiveProfileQuery } from "@/features/profiles"
import { buttonVariants } from "@/shared/ui/button"
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyTitle,
} from "@/shared/ui/empty"
import { InfiniteList } from "@/shared/ui/infinite-list"
import { PageHeader, PageSection } from "@/shared/ui/page"
import { Skeleton } from "@/shared/ui/skeleton"

import { HistoryCycleItem } from "../components/history-cycle-item"
import { useHistoryCyclesInfiniteQuery } from "../lib/history.query"
import { useMarkCyclePaidMutation } from "../lib/history.mutations"

export function HistoryPage() {
  const activeProfileQuery = useCurrentActiveProfileQuery()
  const activeProfileId = activeProfileQuery.data?.id ?? null
  const historyQuery = useHistoryCyclesInfiniteQuery(activeProfileId)
  const markCyclePaidMutation = useMarkCyclePaidMutation()
  const [markingCycleId, setMarkingCycleId] = useState<string | null>(null)
  const [markCyclePaidError, setMarkCyclePaidError] = useState<string | null>(null)

  const cycles = historyQuery.data?.pages.flatMap((page) => page.items) ?? []
  const isActiveProfileLoading =
    activeProfileQuery.isLoading && activeProfileId === null

  async function handleMarkCyclePaid(zakatCycleId: string) {
    setMarkingCycleId(zakatCycleId)
    setMarkCyclePaidError(null)

    try {
      await markCyclePaidMutation.mutateAsync(zakatCycleId)
    } catch (error) {
      setMarkCyclePaidError(
        error instanceof Error && error.message
          ? error.message
          : m.history_mark_cycle_paid_error(),
      )
    } finally {
      setMarkingCycleId(null)
    }
  }

  return (
    <PageSection className="gap-6">
      <PageHeader
        eyebrow={m.history_eyebrow()}
        title={m.history_title()}
        description={m.history_description()}
      />

      {markCyclePaidError ? (
        <p className="rounded-2xl border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm leading-6 text-destructive">
          {markCyclePaidError}
        </p>
      ) : null}

      {historyQuery.isError ? (
        <p className="rounded-2xl border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm leading-6 text-destructive">
          {historyQuery.error instanceof Error && historyQuery.error.message
            ? historyQuery.error.message
            : m.history_list_load_error()}
        </p>
      ) : (
        <InfiniteList
          items={cycles}
          hasMore={historyQuery.hasNextPage}
          isLoading={isActiveProfileLoading || historyQuery.isLoading}
          isFetchingNextPage={historyQuery.isFetchingNextPage}
          onLoadMore={() => void historyQuery.fetchNextPage()}
          getItemKey={(cycle) => cycle.id}
          renderItem={(cycle) => (
            <HistoryCycleItem
              cycle={cycle}
              isMarkingPaid={markingCycleId === cycle.id && markCyclePaidMutation.isPending}
              onMarkPaid={handleMarkCyclePaid}
            />
          )}
          loadingLabel={m.history_list_loading()}
          loadMoreLabel={m.history_list_load_more()}
          loadingState={
            <div className="space-y-3">
              <Skeleton className="h-40 w-full rounded-[1.5rem]" />
              <Skeleton className="h-40 w-full rounded-[1.5rem]" />
              <Skeleton className="h-40 w-full rounded-[1.5rem]" />
            </div>
          }
          emptyState={
            activeProfileId === null ? (
              <Empty className="border-border/70 bg-background/80">
                <EmptyContent>
                  <EmptyTitle>{m.history_no_active_profile_title()}</EmptyTitle>
                  <EmptyDescription>
                    {m.history_no_active_profile_description()}
                  </EmptyDescription>
                  <Link
                    to="/app/settings"
                    className={buttonVariants({ variant: "default", size: "sm" })}
                  >
                    {m.nav_settings_label()}
                  </Link>
                </EmptyContent>
              </Empty>
            ) : (
              <Empty className="border-border/70 bg-background/80">
                <EmptyContent>
                  <EmptyTitle>{m.history_empty_title()}</EmptyTitle>
                  <EmptyDescription>{m.history_empty_description()}</EmptyDescription>
                  <Link
                    to="/app/wealth-snapshot/new"
                    className={buttonVariants({ variant: "default", size: "sm" })}
                  >
                    {m.wealth_snapshot_create_button_label()}
                  </Link>
                </EmptyContent>
              </Empty>
            )
          }
        />
      )}
    </PageSection>
  )
}
