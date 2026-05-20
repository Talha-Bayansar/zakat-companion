import { useState } from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import { ArrowDown01Icon, Calendar01Icon, Wallet01Icon } from "@hugeicons/core-free-icons"

import { m } from "@/paraglide/messages"

import { getFiqhMadhabLabel, getFiqhNisabBenchmarkLabel } from "@/features/fiqh-calculation"
import { cn } from "@/shared/lib/cn"
import { Item, ItemContent, ItemTitle } from "@/shared/ui/item"
import { Button } from "@/shared/ui/button"
import { Spinner } from "@/shared/ui/spinner"

import {
  getHistoryCycleStateMeta,
  getHistoryPaymentStateMeta,
} from "../lib/history.labels"
import type { HistoryCycleRecord } from "../lib/history.types"

type HistoryCycleItemProps = {
  cycle: HistoryCycleRecord
  isMarkingPaid?: boolean
  onMarkPaid: (cycleId: string) => void | Promise<void>
}

export function HistoryCycleItem({
  cycle,
  isMarkingPaid = false,
  onMarkPaid,
}: HistoryCycleItemProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const cycleState = getHistoryCycleStateMeta(cycle.state)
  const paymentState = getHistoryPaymentStateMeta(cycle.paidAt)
  const sourceSnapshot = cycle.sourceSnapshot
  const detailsId = `history-cycle-${cycle.id}-details`
  const canMarkPaid = cycle.paidAt === null && cycle.state !== "reset"

  return (
    <Item variant="outline" size="default" className="items-start">
      <ItemContent className="w-full gap-3">
        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0 space-y-1">
              <ItemTitle className="w-full text-base sm:text-lg">
                <span className="inline-flex items-center gap-2">
                  <HugeiconsIcon
                    icon={Calendar01Icon}
                    strokeWidth={2}
                    className="size-4 text-muted-foreground"
                  />
                  <span>{formatDate(cycle.dueAt)}</span>
                </span>
              </ItemTitle>
            </div>

            <div className="flex flex-col gap-3 sm:min-w-56 sm:items-end">
              <div className="flex flex-wrap items-center gap-2 sm:justify-end">
                <Pill className={cycleState.className}>{cycleState.label}</Pill>
                <Pill className={paymentState.className}>{paymentState.label}</Pill>
              </div>

              <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
                {canMarkPaid ? (
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    className="w-full rounded-2xl sm:w-auto"
                    disabled={isMarkingPaid}
                    onClick={() => {
                      void onMarkPaid(cycle.id)
                    }}
                    >
                      {isMarkingPaid ? (
                      <>
                        <Spinner label={m.history_cycle_marking_paid()} className="size-4" />
                        <span>{m.history_cycle_marking_paid()}</span>
                      </>
                      ) : (
                        m.history_cycle_mark_paid()
                      )}
                    </Button>
                ) : null}

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="w-full rounded-2xl sm:w-auto"
                  aria-expanded={isExpanded}
                  aria-controls={detailsId}
                  onClick={() => {
                    setIsExpanded((current) => !current)
                  }}
                >
                  <span>{isExpanded ? m.history_cycle_collapse_details() : m.history_cycle_expand_details()}</span>
                  <HugeiconsIcon
                    icon={ArrowDown01Icon}
                    strokeWidth={2}
                    className={cn("size-4 transition-transform", isExpanded ? "rotate-180" : "")}
                  />
                </Button>
              </div>
            </div>
          </div>

          {isExpanded ? (
            <section id={detailsId} className="border-t border-border/60 pt-4">
              <div className="flex items-center gap-2">
                <HugeiconsIcon
                  icon={Wallet01Icon}
                  strokeWidth={2}
                  className="size-4 text-muted-foreground"
                />
                <p className="text-sm font-medium text-foreground">
                  {m.history_cycle_snapshot_title()}
                </p>
              </div>

              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                {sourceSnapshot
                  ? `${m.wealth_snapshot_explanation_captured_at_label()}: ${formatDate(sourceSnapshot.capturedAt)}`
                  : m.history_cycle_snapshot_unavailable()}
              </p>

              {sourceSnapshot ? (
                <dl className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                  <SummaryItem
                    label={m.wealth_snapshot_current_madhab_label()}
                    value={
                      sourceSnapshot.madhab
                        ? getFiqhMadhabLabel(sourceSnapshot.madhab)
                        : m.wealth_snapshot_current_value_unavailable()
                    }
                  />
                  <SummaryItem
                    label={m.wealth_snapshot_current_nisab_benchmark_label()}
                    value={
                      sourceSnapshot.nisabBenchmark
                        ? getFiqhNisabBenchmarkLabel(sourceSnapshot.nisabBenchmark)
                        : m.wealth_snapshot_current_value_unavailable()
                    }
                  />
                  <SummaryItem
                    label={m.wealth_snapshot_current_net_label()}
                    value={formatAmount(sourceSnapshot.netZakatableBase)}
                  />
                  <SummaryItem
                    label={m.wealth_snapshot_current_nisab_status_label()}
                    value={
                      sourceSnapshot.isAboveNisab === null
                        ? m.wealth_snapshot_current_value_unavailable()
                        : sourceSnapshot.isAboveNisab
                          ? m.wealth_snapshot_current_nisab_above_label()
                          : m.wealth_snapshot_current_nisab_below_label()
                    }
                  />
                  <SummaryItem
                    label={m.wealth_snapshot_current_due_amount_label()}
                    value={
                      sourceSnapshot.isZakatDue === null
                        ? m.wealth_snapshot_current_value_unavailable()
                        : sourceSnapshot.isZakatDue
                          ? formatDueAmount(sourceSnapshot.netZakatableBase)
                          : m.wealth_snapshot_current_due_not_yet_label()
                    }
                  />
                </dl>
              ) : (
                <p className="mt-4 text-sm leading-6 text-muted-foreground">
                  {m.history_cycle_snapshot_unavailable()}
                </p>
              )}
            </section>
          ) : null}
        </div>
      </ItemContent>
    </Item>
  )
}

function SummaryItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <dt className="text-[0.7rem] font-medium uppercase tracking-[0.18em] text-muted-foreground">
        {label}
      </dt>
      <dd className="mt-1 text-sm leading-6 text-foreground">{value}</dd>
    </div>
  )
}

function Pill({
  children,
  className,
}: {
  children: React.ReactNode
  className: string
}) {
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center rounded-full border px-3 py-1 text-[0.72rem] font-medium leading-none",
        className,
      )}
    >
      {children}
    </span>
  )
}

function formatDate(value: Date | string) {
  const date = value instanceof Date ? value : new Date(value)
  return Number.isNaN(date.getTime()) ? String(value) : date.toLocaleString()
}

function formatAmount(value: string | null) {
  if (!value) {
    return m.wealth_snapshot_current_value_unavailable()
  }

  const parsed = Number(value)

  if (!Number.isFinite(parsed)) {
    return value
  }

  return new Intl.NumberFormat(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(parsed)
}

function formatDueAmount(netZakatableBase: string | null) {
  if (!netZakatableBase) {
    return m.wealth_snapshot_current_value_unavailable()
  }

  const parsed = Number(netZakatableBase)

  if (!Number.isFinite(parsed)) {
    return netZakatableBase
  }

  return new Intl.NumberFormat(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(parsed * 0.025)
}
