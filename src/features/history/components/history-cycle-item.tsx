import { HugeiconsIcon } from "@hugeicons/react"
import { Calendar01Icon, Wallet01Icon } from "@hugeicons/core-free-icons"

import { m } from "@/paraglide/messages"

import { getFiqhMadhabLabel, getFiqhNisabBenchmarkLabel } from "@/features/fiqh-calculation"
import { cn } from "@/shared/lib/cn"
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemHeader,
  ItemTitle,
} from "@/shared/ui/item"
import { Button } from "@/shared/ui/button"
import { Spinner } from "@/shared/ui/spinner"

import {
  getHistoryCycleStateMeta,
  getHistoryPaymentStateMeta,
  getHistoryReminderAttemptStatusMeta,
  getHistoryReminderChannelMeta,
  getHistoryReminderJobKindMeta,
  getHistoryReminderJobPhaseMeta,
  getHistoryReminderJobStatusMeta,
} from "../lib/history.labels"
import type {
  HistoryCycleRecord,
  HistoryReminderJob,
} from "../lib/history.types"

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
  const cycleState = getHistoryCycleStateMeta(cycle.state)
  const paymentState = getHistoryPaymentStateMeta(cycle.paidAt)
  const sourceSnapshot = cycle.sourceSnapshot

  return (
    <Item variant="outline" size="default" className="items-start gap-4">
      <ItemContent className="gap-3">
        <ItemHeader className="items-start">
          <div className="min-w-0 flex-1">
            <ItemTitle>
              <span className="inline-flex items-center gap-2">
                <HugeiconsIcon icon={Calendar01Icon} strokeWidth={2} className="size-4 text-muted-foreground" />
                <span>{formatDate(cycle.dueAt)}</span>
              </span>
            </ItemTitle>
            <ItemDescription>
              {sourceSnapshot
                ? `${m.history_cycle_snapshot_title()}: ${formatDate(sourceSnapshot.capturedAt)}`
                : m.history_cycle_snapshot_unavailable()}
            </ItemDescription>
          </div>

          <ItemActions className="ml-auto flex flex-wrap items-center justify-end gap-2">
            <Pill className={cycleState.className}>{cycleState.label}</Pill>
            <Pill className={paymentState.className}>{paymentState.label}</Pill>
            {cycle.paidAt ? null : (
              <Button
                type="button"
                variant="secondary"
                size="sm"
                className="rounded-2xl"
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
            )}
          </ItemActions>
        </ItemHeader>

        <section className="rounded-2xl border border-border/60 bg-background/70 px-3 py-3">
          <div className="flex items-center gap-2">
            <HugeiconsIcon icon={Wallet01Icon} strokeWidth={2} className="size-4 text-muted-foreground" />
            <p className="text-sm font-medium text-foreground">
              {m.history_cycle_snapshot_title()}
            </p>
          </div>

          {sourceSnapshot ? (
            <dl className="mt-3 grid gap-2 sm:grid-cols-2">
              <SummaryItem label={m.wealth_snapshot_explanation_captured_at_label()} value={formatDate(sourceSnapshot.capturedAt)} />
              <SummaryItem
                label={m.wealth_snapshot_current_madhab_label()}
                value={sourceSnapshot.madhab ? getFiqhMadhabLabel(sourceSnapshot.madhab) : m.wealth_snapshot_current_value_unavailable()}
              />
              <SummaryItem
                label={m.wealth_snapshot_current_nisab_benchmark_label()}
                value={sourceSnapshot.nisabBenchmark ? getFiqhNisabBenchmarkLabel(sourceSnapshot.nisabBenchmark) : m.wealth_snapshot_current_value_unavailable()}
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
            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              {m.history_cycle_snapshot_unavailable()}
            </p>
          )}
        </section>

        <section className="rounded-2xl border border-border/60 bg-background/70 px-3 py-3">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="text-sm font-medium text-foreground">
                {m.history_cycle_reminders_title()}
              </p>
              <p className="text-xs leading-5 text-muted-foreground">
                {m.history_reminder_attempts_label()}: {cycle.reminderJobs.length}
              </p>
            </div>
          </div>

          {cycle.reminderJobs.length ? (
            <div className="mt-3 flex flex-col gap-3">
              {cycle.reminderJobs.map((job) => (
                <ReminderJobRow key={job.id} job={job} />
              ))}
            </div>
          ) : (
            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              {m.history_cycle_reminders_empty()}
            </p>
          )}
        </section>
      </ItemContent>
    </Item>
  )
}

function ReminderJobRow({ job }: { job: HistoryReminderJob }) {
  const kind = getHistoryReminderJobKindMeta(job)
  const status = getHistoryReminderJobStatusMeta(job.status)
  const phase = job.kind === "zakat_due" ? getHistoryReminderJobPhaseMeta(job.phase) : null

  return (
    <div className="rounded-xl border border-border/60 bg-background/80 px-3 py-3">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-foreground">{kind.label}</p>
          <p className="text-xs leading-5 text-muted-foreground">
            {formatDate(job.scheduledFor)}
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-end gap-2">
          <Pill className={kind.className}>{kind.label}</Pill>
          {phase ? <Pill className={phase.className}>{phase.label}</Pill> : null}
          <Pill className={status.className}>{status.label}</Pill>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        {job.deliveryAttempts.length ? (
          job.deliveryAttempts.map((attempt) => (
            <AttemptChip key={attempt.id} attempt={attempt} />
          ))
        ) : (
          <span className="text-xs text-muted-foreground">
            {m.history_reminder_attempts_label()}: 0
          </span>
        )}
      </div>
    </div>
  )
}

function AttemptChip({ attempt }: { attempt: HistoryReminderJob["deliveryAttempts"][number] }) {
  const channel = getHistoryReminderChannelMeta(attempt.channel)
  const status = getHistoryReminderAttemptStatusMeta(attempt.status)

  return (
    <span
      className={cn(
        "inline-flex max-w-full items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium",
        "text-balance",
        channel.className,
      )}
    >
      <span>{channel.label}</span>
      <span className="text-current/60">·</span>
      <span>{status.label}</span>
      <span className="text-current/60">·</span>
      <span>{formatDate(attempt.attemptedAt)}</span>
    </span>
  )
}

function SummaryItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border/60 bg-background/80 px-3 py-2.5">
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
