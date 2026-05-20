import { Link } from "@tanstack/react-router"
import { Calendar01Icon, Wallet01Icon } from "@hugeicons/core-free-icons"

import { m } from "@/paraglide/messages"

import type { HistoryCycleRecord } from "@/features/history"
import { buttonVariants } from "@/shared/ui/button"
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyTitle,
} from "@/shared/ui/empty"
import { Skeleton } from "@/shared/ui/skeleton"
import { Surface } from "@/shared/ui/surface"

import {
  CycleStatePill,
  SummaryRow,
  formatDate,
  isActiveCycle,
} from "./current-cycle-panel.parts"

type CurrentSnapshot = {
  capturedAt: Date | string
  isAboveNisab: boolean | null
} | null | undefined

type CurrentCyclePanelProps = {
  activeProfileId: string | null
  isActiveProfileLoading: boolean
  currentSnapshot: CurrentSnapshot
  isCurrentSnapshotLoading: boolean
  latestCycle: HistoryCycleRecord | null
  isHistoryLoading: boolean
}

export function CurrentCyclePanel({
  activeProfileId,
  isActiveProfileLoading,
  currentSnapshot,
  isCurrentSnapshotLoading,
  latestCycle,
  isHistoryLoading,
}: CurrentCyclePanelProps) {
  const isLoading =
    isActiveProfileLoading || isCurrentSnapshotLoading || isHistoryLoading
  const activeCycle =
    latestCycle && isActiveCycle(latestCycle.state) ? latestCycle : null

  return (
    <section className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <p className="text-sm font-medium text-foreground">{m.home_next_up()}</p>
        <p className="text-sm leading-6 text-muted-foreground">
          {m.home_next_up_body()}
        </p>
      </div>

      {isLoading ? (
        <Skeleton className="h-64 w-full rounded-[1.75rem]" />
      ) : activeProfileId === null ? (
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
      ) : currentSnapshot == null ? (
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
      ) : activeCycle ? (
        <Surface variant="elevated" rounded="xl" padding="lg" className="space-y-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="space-y-1">
              <p className="text-sm font-medium text-foreground">
                {m.home_next_up()}
              </p>
              <p className="text-sm leading-6 text-muted-foreground">
                {m.home_next_up_body()}
              </p>
            </div>

            <CycleStatePill state={activeCycle.state} />
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <SummaryRow
              icon={Calendar01Icon}
              label={m.wealth_snapshot_explanation_hawl_due_at_label()}
              value={formatDate(activeCycle.dueAt)}
            />
            <SummaryRow
              icon={Wallet01Icon}
              label={m.wealth_snapshot_explanation_captured_at_label()}
              value={formatDate(currentSnapshot.capturedAt)}
            />
          </div>

          <div className="flex flex-col gap-2 sm:flex-row">
            <Link
              to="/app/history"
              className={buttonVariants({ variant: "secondary", size: "sm" })}
            >
              {m.nav_history_label()}
            </Link>
            <Link
              to="/app/wealth-snapshot/edit"
              className={buttonVariants({ variant: "outline", size: "sm" })}
            >
              {m.wealth_snapshot_refresh_cta()}
            </Link>
          </div>
        </Surface>
      ) : latestCycle?.state === "paid" ? (
        <Empty className="border-border/70 bg-background/80">
          <EmptyContent>
            <EmptyTitle>{m.cycle_status_paid_title()}</EmptyTitle>
            <EmptyDescription>{m.cycle_status_paid_description()}</EmptyDescription>
            <Link
              to="/app/history"
              className={buttonVariants({ variant: "default", size: "sm" })}
            >
              {m.nav_history_label()}
            </Link>
          </EmptyContent>
        </Empty>
      ) : currentSnapshot.isAboveNisab === false ? (
        <Empty className="border-border/70 bg-background/80">
          <EmptyContent>
            <EmptyTitle>{m.cycle_status_below_nisab_title()}</EmptyTitle>
            <EmptyDescription>
              {m.cycle_status_below_nisab_description()}
            </EmptyDescription>
            <Link
              to="/app/wealth-snapshot/new"
              className={buttonVariants({ variant: "default", size: "sm" })}
            >
              {m.wealth_snapshot_create_button_label()}
            </Link>
          </EmptyContent>
        </Empty>
      ) : (
        <Empty className="border-border/70 bg-background/80">
          <EmptyContent>
            <EmptyTitle>{m.cycle_status_no_active_cycle_title()}</EmptyTitle>
            <EmptyDescription>
              {m.cycle_status_no_active_cycle_description()}
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
  )
}
