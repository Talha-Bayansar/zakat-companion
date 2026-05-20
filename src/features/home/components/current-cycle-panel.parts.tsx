import type { ComponentProps } from "react"

import { HugeiconsIcon } from "@hugeicons/react"

import { m } from "@/paraglide/messages"

import type { HistoryCycleRecord } from "@/features/history"

export function isActiveCycle(state: HistoryCycleRecord["state"] | null) {
  return state === "open" || state === "due" || state === "followed_up"
}

export function CycleStatePill({ state }: { state: HistoryCycleRecord["state"] }) {
  const meta = getCycleStateMeta(state)

  return (
    <span
      className={[
        "inline-flex shrink-0 items-center rounded-full border px-3 py-1 text-[0.72rem] font-medium leading-none",
        meta.className,
      ].join(" ")}
    >
      {meta.label}
    </span>
  )
}

export function SummaryRow({
  icon,
  label,
  value,
}: {
  icon: ComponentProps<typeof HugeiconsIcon>["icon"]
  label: string
  value: string
}) {
  return (
    <div className="flex items-start gap-3 rounded-2xl border border-border/60 bg-background/70 px-4 py-3">
      <span className="mt-0.5 inline-flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
        <HugeiconsIcon icon={icon} strokeWidth={2} className="size-4" />
      </span>
      <div className="min-w-0">
        <p className="text-[0.7rem] font-medium uppercase tracking-[0.18em] text-muted-foreground">
          {label}
        </p>
        <p className="mt-0.5 text-sm leading-6 text-foreground">{value}</p>
      </div>
    </div>
  )
}

export function formatDate(value: Date | string) {
  const date = value instanceof Date ? value : new Date(value)
  return Number.isNaN(date.getTime()) ? String(value) : date.toLocaleString()
}

function getCycleStateMeta(state: HistoryCycleRecord["state"]) {
  switch (state) {
    case "open":
      return {
        label: m.history_cycle_state_open(),
        className: "border-border/70 bg-muted/50 text-muted-foreground",
      }
    case "due":
      return {
        label: m.history_cycle_state_due(),
        className:
          "border-amber-500/15 bg-amber-500/10 text-amber-700 dark:text-amber-300",
      }
    case "paid":
      return {
        label: m.history_cycle_state_paid(),
        className:
          "border-emerald-500/15 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
      }
    case "followed_up":
      return {
        label: m.history_cycle_state_followed_up(),
        className:
          "border-sky-500/15 bg-sky-500/10 text-sky-700 dark:text-sky-300",
      }
    case "reset":
      return {
        label: m.history_cycle_state_reset(),
        className:
          "border-slate-500/15 bg-slate-500/10 text-slate-700 dark:text-slate-300",
      }
    default:
      return {
        label: m.history_cycle_state_unknown(),
        className: "border-border/70 bg-muted/50 text-muted-foreground",
      }
  }
}
