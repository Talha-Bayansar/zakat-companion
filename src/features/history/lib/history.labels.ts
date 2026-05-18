import { m } from "@/paraglide/messages"

import type {
  HistoryCycleRecord,
  HistoryReminderDeliveryAttempt,
  HistoryReminderJob,
} from "./history.types"

type PillMeta = {
  label: string
  className: string
}

const pillToneClasses = {
  neutral: "border-border/70 bg-muted/50 text-muted-foreground",
  primary: "border-primary/15 bg-primary/10 text-primary",
  emerald:
    "border-emerald-500/15 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
  amber:
    "border-amber-500/15 bg-amber-500/10 text-amber-700 dark:text-amber-300",
  sky: "border-sky-500/15 bg-sky-500/10 text-sky-700 dark:text-sky-300",
  rose: "border-destructive/15 bg-destructive/10 text-destructive",
  slate: "border-slate-500/15 bg-slate-500/10 text-slate-700 dark:text-slate-300",
} as const

export function getHistoryCycleStateMeta(
  state: HistoryCycleRecord["state"],
): PillMeta {
  switch (state) {
    case "open":
      return { label: m.history_cycle_state_open(), className: pillToneClasses.neutral }
    case "due":
      return { label: m.history_cycle_state_due(), className: pillToneClasses.amber }
    case "paid":
      return { label: m.history_cycle_state_paid(), className: pillToneClasses.emerald }
    case "followed_up":
      return { label: m.history_cycle_state_followed_up(), className: pillToneClasses.sky }
    default:
      return { label: String(state), className: pillToneClasses.neutral }
  }
}

export function getHistoryPaymentStateMeta(paidAt: Date | null): PillMeta {
  if (paidAt) {
    return {
      label: m.history_cycle_payment_paid(),
      className: pillToneClasses.emerald,
    }
  }

  return {
    label: m.history_cycle_payment_unpaid(),
    className: pillToneClasses.neutral,
  }
}

export function getHistoryReminderJobKindMeta(
  job: HistoryReminderJob,
): PillMeta {
  if (job.kind === "balance_update") {
    return {
      label: m.history_reminder_kind_balance_update(),
      className: pillToneClasses.slate,
    }
  }

  return {
    label: m.history_reminder_kind_zakat_due(),
    className: pillToneClasses.primary,
  }
}

export function getHistoryReminderJobPhaseMeta(
  phase: Extract<HistoryReminderJob, { kind: "zakat_due" }>["phase"],
): PillMeta {
  switch (phase) {
    case "before_due":
      return {
        label: m.history_reminder_phase_before_due(),
        className: pillToneClasses.amber,
      }
    case "due":
      return {
        label: m.history_reminder_phase_due(),
        className: pillToneClasses.primary,
      }
    case "follow_up":
      return {
        label: m.history_reminder_phase_follow_up(),
        className: pillToneClasses.sky,
      }
    default:
      return { label: String(phase), className: pillToneClasses.neutral }
  }
}

export function getHistoryReminderJobStatusMeta(
  status: HistoryReminderJob["status"],
): PillMeta {
  switch (status) {
    case "pending":
      return {
        label: m.history_reminder_job_status_pending(),
        className: pillToneClasses.neutral,
      }
    case "claimed":
      return {
        label: m.history_reminder_job_status_claimed(),
        className: pillToneClasses.amber,
      }
    case "succeeded":
      return {
        label: m.history_reminder_job_status_succeeded(),
        className: pillToneClasses.emerald,
      }
    case "failed":
      return {
        label: m.history_reminder_job_status_failed(),
        className: pillToneClasses.rose,
      }
    default:
      return { label: String(status), className: pillToneClasses.neutral }
  }
}

export function getHistoryReminderAttemptStatusMeta(
  status: HistoryReminderDeliveryAttempt["status"],
): PillMeta {
  switch (status) {
    case "succeeded":
      return {
        label: m.history_reminder_job_status_succeeded(),
        className: pillToneClasses.emerald,
      }
    case "failed":
      return {
        label: m.history_reminder_job_status_failed(),
        className: pillToneClasses.rose,
      }
    default:
      return { label: String(status), className: pillToneClasses.neutral }
  }
}

export function getHistoryReminderChannelMeta(
  channel: HistoryReminderDeliveryAttempt["channel"],
): PillMeta {
  switch (channel) {
    case "web_push":
      return {
        label: m.history_reminder_channel_web_push(),
        className: pillToneClasses.slate,
      }
    default:
      return { label: String(channel), className: pillToneClasses.neutral }
  }
}
