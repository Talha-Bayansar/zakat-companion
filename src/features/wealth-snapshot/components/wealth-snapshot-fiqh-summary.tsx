import { HugeiconsIcon } from "@hugeicons/react"
import {
  AlertCircleIcon,
  BadgeInfoIcon,
  Calendar01Icon,
  ValidationApprovalIcon,
  ZakatIcon,
} from "@hugeicons/core-free-icons"

import { m } from "@/paraglide/messages"

import type { WealthSnapshotRecord } from "../lib/wealth-snapshot.types"

type WealthSnapshotFiqhSummaryProps = {
  snapshot: WealthSnapshotRecord
}

type HugeIcon = React.ComponentProps<typeof HugeiconsIcon>["icon"]

export function WealthSnapshotFiqhSummary({
  snapshot,
}: WealthSnapshotFiqhSummaryProps) {
  const nisabStatus = getNisabStatus(snapshot)
  const dueAmount = getDueAmount(snapshot)
  const dateRule = getDateRuleSummary(snapshot.madhab)

  return (
    <div className="space-y-2.5">
      <StatusRow
        icon={nisabStatus.icon}
        iconClassName={nisabStatus.iconClassName}
        label={m.wealth_snapshot_current_nisab_status_label()}
        value={nisabStatus.value}
        valueClassName={nisabStatus.valueClassName}
      />
      <StatusRow
        icon={ZakatIcon}
        iconClassName={dueAmount.iconClassName}
        label={m.wealth_snapshot_current_due_amount_label()}
        value={dueAmount.value}
        valueClassName={dueAmount.valueClassName}
      />
      <StatusRow
        icon={Calendar01Icon}
        iconClassName="bg-sky-500/10 text-sky-600 dark:bg-sky-400/10 dark:text-sky-300"
        label={m.wealth_snapshot_current_date_rule_label()}
        value={dateRule}
        valueClassName="text-muted-foreground"
      />
    </div>
  )
}

function StatusRow({
  icon,
  iconClassName,
  label,
  value,
  valueClassName,
}: {
  icon: HugeIcon
  iconClassName: string
  label: string
  value: string
  valueClassName: string
}) {
  return (
    <div className="flex items-start gap-3">
      <span
        className={[
          "mt-0.5 inline-flex size-8 shrink-0 items-center justify-center rounded-full",
          iconClassName,
        ].join(" ")}
      >
        <HugeiconsIcon icon={icon} strokeWidth={2} className="size-4" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-[0.7rem] font-medium uppercase tracking-[0.18em] text-muted-foreground">
          {label}
        </p>
        <p className={["mt-0.5 text-sm leading-6 sm:text-[0.95rem]", valueClassName].join(" ")}>
          {value}
        </p>
      </div>
    </div>
  )
}

function getNisabStatus(snapshot: WealthSnapshotRecord) {
  if (snapshot.isAboveNisab === null) {
    return {
      icon: BadgeInfoIcon,
      iconClassName: "bg-muted/50 text-muted-foreground",
      value: m.wealth_snapshot_current_value_unavailable(),
      valueClassName: "text-muted-foreground",
    }
  }

  if (snapshot.isAboveNisab) {
    return {
      icon: ValidationApprovalIcon,
      iconClassName:
        "bg-emerald-500/10 text-emerald-600 dark:bg-emerald-400/10 dark:text-emerald-300",
      value: m.wealth_snapshot_current_nisab_above_label(),
      valueClassName: "font-medium text-emerald-700 dark:text-emerald-300",
    }
  }

  return {
    icon: AlertCircleIcon,
    iconClassName:
      "bg-amber-500/10 text-amber-700 dark:bg-amber-400/10 dark:text-amber-300",
    value: m.wealth_snapshot_current_nisab_below_label(),
    valueClassName: "font-medium text-amber-700 dark:text-amber-300",
  }
}

function getDueAmount(snapshot: WealthSnapshotRecord) {
  if (snapshot.isZakatDue === null) {
    return {
      iconClassName: "bg-muted/50 text-muted-foreground",
      value: m.wealth_snapshot_current_value_unavailable(),
      valueClassName: "text-muted-foreground",
    }
  }

  if (!snapshot.isZakatDue) {
    return {
      iconClassName: "bg-muted/50 text-muted-foreground",
      value: m.wealth_snapshot_current_due_not_yet_label(),
      valueClassName: "text-muted-foreground",
    }
  }

  const amount = parseAmount(snapshot.netZakatableBase) * 0.025

  return {
    iconClassName:
      "bg-emerald-500/10 text-emerald-600 dark:bg-emerald-400/10 dark:text-emerald-300",
    value: new Intl.NumberFormat(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount),
    valueClassName: "font-medium text-emerald-700 dark:text-emerald-300",
  }
}

function parseAmount(amount: string | null) {
  const parsed = Number(amount ?? "0")
  return Number.isFinite(parsed) ? parsed : 0
}

function getDateRuleSummary(snapshotMadhab: WealthSnapshotRecord["madhab"]) {
  if (!snapshotMadhab) {
    return m.wealth_snapshot_current_date_rule_unavailable()
  }

  switch (snapshotMadhab) {
    case "hanafi":
      return m.wealth_snapshot_current_date_rule_preserve_summary()
    case "maliki":
    case "shafii":
    case "hanbali":
      return m.wealth_snapshot_current_date_rule_reset_summary()
  }
}
