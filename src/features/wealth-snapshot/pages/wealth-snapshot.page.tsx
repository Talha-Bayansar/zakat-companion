import { Link } from "@tanstack/react-router"
import { HugeiconsIcon } from "@hugeicons/react"
import { Wallet01Icon } from "@hugeicons/core-free-icons"

import { m } from "@/paraglide/messages"

import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyTitle,
} from "@/shared/ui/empty"
import { buttonVariants } from "@/shared/ui/button"
import { InfiniteList } from "@/shared/ui/infinite-list"
import { PageHeader, PageSection } from "@/shared/ui/page"
import { Skeleton } from "@/shared/ui/skeleton"

import { useCurrentActiveProfileQuery } from "@/features/profiles"

import { WealthSnapshotFiqhSummary } from "../components/wealth-snapshot-fiqh-summary"
import { WealthSnapshotFiqhExplanation } from "../components/wealth-snapshot-fiqh-explanation"
import { WealthSnapshotHistoryItem } from "../components/wealth-snapshot-history-item"
import {
  useWealthSnapshotHistoryInfiniteQuery,
  useWealthSnapshotQuery,
} from "../lib/wealth-snapshot.query"
import type { WealthSnapshotRecord } from "../lib/wealth-snapshot.types"

export function WealthSnapshotPage() {
  const activeProfileQuery = useCurrentActiveProfileQuery()
  const activeProfileId = activeProfileQuery.data?.id ?? null
  const currentSnapshotQuery = useWealthSnapshotQuery(activeProfileId)
  const historyQuery = useWealthSnapshotHistoryInfiniteQuery(activeProfileId)

  const currentSnapshot = currentSnapshotQuery.data
  const history = historyQuery.data?.pages.flatMap((page) => page.items) ?? []
  const isActiveProfileLoading =
    activeProfileQuery.isLoading && activeProfileId === null

  return (
    <PageSection className="gap-6">
      <div className="flex items-start justify-between gap-4">
        <PageHeader
          eyebrow={m.wealth_eyebrow()}
          title={m.wealth_title()}
          description={m.wealth_description()}
        />

      </div>

      <section className="flex flex-col gap-4 border-t border-b border-border/60 py-4">
        <div className="flex flex-col gap-1">
          <p className="text-sm font-medium text-foreground">
            {m.wealth_snapshot_current_title()}
          </p>
          <p className="text-sm leading-6 text-muted-foreground">
            {m.wealth_snapshot_current_description()}
          </p>
        </div>

        {isActiveProfileLoading || currentSnapshotQuery.isLoading ? (
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <Skeleton className="size-4 rounded-full" />
            <span>{m.wealth_snapshot_current_title()}</span>
          </div>
        ) : currentSnapshot ? (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <span className="inline-flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                <HugeiconsIcon icon={Wallet01Icon} strokeWidth={2} className="size-4" />
              </span>
              <div className="min-w-0">
                <p className="text-[0.7rem] font-medium uppercase tracking-[0.18em] text-muted-foreground">
                  {m.wealth_snapshot_current_net_label()}
                </p>
                <p className="text-sm font-medium leading-6 text-foreground sm:text-[0.95rem]">
                  {formatSnapshotAmount(currentSnapshot.entries)}
                </p>
              </div>
            </div>

            <WealthSnapshotFiqhSummary snapshot={currentSnapshot} />
            <WealthSnapshotFiqhExplanation snapshot={currentSnapshot} />

            <div className="flex flex-col gap-2">
              <Link
                to="/app/wealth-snapshot/edit"
                className={buttonVariants({ variant: "secondary", size: "sm" })}
              >
                {m.wealth_snapshot_refresh_cta()}
              </Link>
              <p className="text-xs leading-5 text-muted-foreground">
                {m.wealth_snapshot_refresh_warning()}
              </p>
            </div>
          </div>
        ) : (
          <Empty className="border-border/70 bg-background/80">
            <EmptyContent>
              <EmptyTitle>{m.wealth_snapshot_current_empty_title()}</EmptyTitle>
              <EmptyDescription>
                {m.wealth_snapshot_current_empty_description()}
              </EmptyDescription>
              <Link
                to="/app/wealth-snapshot/new"
                className={buttonVariants({ variant: "default", size: "sm" })}
              >
                {m.wealth_snapshot_create_button_label()}
              </Link>
            </EmptyContent>
          </Empty>
        )}
      </section>

      <section className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <p className="text-sm font-medium text-foreground">
            {m.wealth_snapshot_history_title()}
          </p>
          <p className="text-sm leading-6 text-muted-foreground">
            {m.wealth_snapshot_history_description()}
          </p>
        </div>

        {historyQuery.isError ? (
          <p className="rounded-2xl border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm leading-6 text-destructive">
            {m.wealth_snapshot_history_load_error()}
          </p>
        ) : (
          <InfiniteList
            items={history}
            hasMore={historyQuery.hasNextPage}
            isLoading={isActiveProfileLoading || historyQuery.isLoading}
            isFetchingNextPage={historyQuery.isFetchingNextPage}
            onLoadMore={() => void historyQuery.fetchNextPage()}
            getItemKey={(snapshot) => snapshot.id}
            renderItem={(snapshot) => (
              <WealthSnapshotHistoryItem snapshot={snapshot} />
            )}
            loadingLabel={m.wealth_snapshot_history_title()}
            loadMoreLabel={m.wealth_snapshot_history_load_more()}
            loadingState={
              <div className="space-y-3">
                <Skeleton className="h-16 w-full rounded-[1.5rem]" />
                <Skeleton className="h-16 w-full rounded-[1.5rem]" />
                <Skeleton className="h-16 w-full rounded-[1.5rem]" />
              </div>
            }
            emptyState={
              <Empty className="border-border/70 bg-background/80">
                <EmptyContent>
                  <EmptyTitle>
                    {m.wealth_snapshot_history_empty_title()}
                  </EmptyTitle>
                  <EmptyDescription>
                    {m.wealth_snapshot_history_empty_description()}
                  </EmptyDescription>
                </EmptyContent>
              </Empty>
            }
          />
        )}
      </section>
    </PageSection>
  )
}

function formatSnapshotAmount(entries: WealthSnapshotRecord["entries"]) {
  const amount = entries.reduce((total, entry) => {
    const parsed = Number(entry.amount)
    const normalized = Number.isFinite(parsed) ? parsed : 0

    return entry.category === "debts_liabilities"
      ? total - normalized
      : total + normalized
  }, 0)

  return new Intl.NumberFormat(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)
}
