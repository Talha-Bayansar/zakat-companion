import { Link } from "@tanstack/react-router"
import { HugeiconsIcon } from "@hugeicons/react"
import { CursorEdit02Icon } from "@hugeicons/core-free-icons"

import { m } from "@/paraglide/messages"

import { useCurrentActiveProfileQuery } from "@/features/profiles"
import {
  type ReminderPreferenceRecord,
  useReminderPreferenceQuery,
} from "@/features/reminders"
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyTitle,
} from "@/shared/ui/empty"
import { Spinner } from "@/shared/ui/spinner"
import { Surface } from "@/shared/ui/surface"

function getReminderCadenceLabel(
  cadence: ReminderPreferenceRecord["balanceUpdateCadence"],
) {
  return cadence === "daily"
    ? m.settings_reminders_cadence_daily()
    : cadence === "weekly"
      ? m.settings_reminders_cadence_weekly()
      : cadence === "monthly"
        ? m.settings_reminders_cadence_monthly()
        : m.settings_reminders_cadence_quarterly()
}

function getQuietHoursValue(preference: ReminderPreferenceRecord) {
  if (!preference.quietHours) {
    return m.settings_reminders_quiet_hours_disabled()
  }

  return `${m.settings_reminders_quiet_hours_enabled()} · ${preference.quietHours.startTime} - ${preference.quietHours.endTime}`
}

export function ReminderPreferencesSection() {
  const currentActiveProfileQuery = useCurrentActiveProfileQuery()
  const activeProfile = currentActiveProfileQuery.data ?? null
  const reminderPreferenceQuery = useReminderPreferenceQuery(
    activeProfile?.canManageAccess ? activeProfile.id : null,
  )

  if (currentActiveProfileQuery.isLoading) {
    return (
      <Surface rounded="xl" padding="lg" className="space-y-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Spinner
            label={m.settings_reminders_loading()}
            className="size-4"
          />
          <span>{m.settings_reminders_loading()}</span>
        </div>
      </Surface>
    )
  }

  if (currentActiveProfileQuery.isError) {
    return (
      <p className="rounded-[1.75rem] border border-destructive/20 bg-destructive/5 px-5 py-4 text-sm leading-6 text-destructive">
        {m.settings_reminders_load_error()}
      </p>
    )
  }

  if (!activeProfile) {
    return (
      <Surface rounded="xl" padding="lg" className="space-y-4">
        <div className="flex flex-col gap-1">
          <p className="text-sm font-medium text-foreground">
            {m.settings_reminders_title()}
          </p>
          <p className="text-sm leading-6 text-muted-foreground">
            {m.settings_reminders_summary_description()}
          </p>
        </div>

        <Empty className="border-border/70 bg-background/80">
          <EmptyContent>
            <EmptyTitle>{m.settings_reminders_no_active_profile_title()}</EmptyTitle>
            <EmptyDescription>
              {m.settings_reminders_no_active_profile_description()}
            </EmptyDescription>
          </EmptyContent>
        </Empty>
      </Surface>
    )
  }

  if (!activeProfile.canManageAccess) {
    return null
  }

  if (reminderPreferenceQuery.isLoading) {
    return (
      <Surface rounded="xl" padding="lg" className="space-y-4">
        <div className="flex flex-col gap-1">
          <p className="text-sm font-medium text-foreground">
            {m.settings_reminders_title()}
          </p>
          <p className="text-sm leading-6 text-muted-foreground">
            {m.settings_reminders_summary_description()}
          </p>
        </div>

        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Spinner
            label={m.settings_reminders_loading()}
            className="size-4"
          />
          <span>{m.settings_reminders_loading()}</span>
        </div>
      </Surface>
    )
  }

  if (reminderPreferenceQuery.isError) {
    return (
      <p className="rounded-[1.75rem] border border-destructive/20 bg-destructive/5 px-5 py-4 text-sm leading-6 text-destructive">
        {m.settings_reminders_load_error()}
      </p>
    )
  }

  const reminderPreference = reminderPreferenceQuery.data ?? null

  if (!reminderPreference) {
    return (
      <Surface rounded="xl" padding="lg" className="space-y-4">
        <div className="flex flex-col gap-1">
          <p className="text-sm font-medium text-foreground">
            {m.settings_reminders_title()}
          </p>
          <p className="text-sm leading-6 text-muted-foreground">
            {m.settings_reminders_summary_description()}
          </p>
        </div>

        <Empty className="border-border/70 bg-background/80">
          <EmptyContent>
            <EmptyTitle>{m.settings_reminders_no_active_profile_title()}</EmptyTitle>
            <EmptyDescription>
              {m.settings_reminders_no_active_profile_description()}
            </EmptyDescription>
          </EmptyContent>
        </Empty>
      </Surface>
    )
  }

  return (
    <Surface rounded="xl" padding="lg" className="space-y-4">
      <div className="flex items-start justify-between gap-4">
        <div className="flex flex-col gap-1">
          <p className="text-sm font-medium text-foreground">
            {m.settings_reminders_title()}
          </p>
          <p className="text-sm leading-6 text-muted-foreground">
            {m.settings_reminders_summary_description()}
          </p>
        </div>

        <Link
          to="/app/settings/reminders"
          className="inline-flex size-8 shrink-0 items-center justify-center rounded-4xl border border-transparent bg-secondary text-secondary-foreground transition-all outline-none hover:bg-secondary/80 focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
          aria-label={m.common_edit()}
          title={m.common_edit()}
        >
          <HugeiconsIcon icon={CursorEdit02Icon} strokeWidth={2} className="size-4" />
        </Link>
      </div>

      <dl className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1">
          <dt className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
            {m.settings_reminders_balance_cadence_label()}
          </dt>
          <dd className="text-sm leading-6 text-foreground">
            {getReminderCadenceLabel(reminderPreference.balanceUpdateCadence)}
          </dd>
        </div>

        <div className="space-y-1">
          <dt className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
            {m.settings_reminders_timezone_label()}
          </dt>
          <dd className="text-sm leading-6 text-foreground">
            {reminderPreference.timezone}
          </dd>
        </div>

        <div className="space-y-1">
          <dt className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
            {m.settings_reminders_quiet_hours_label()}
          </dt>
          <dd className="text-sm leading-6 text-foreground">
            {getQuietHoursValue(reminderPreference)}
          </dd>
        </div>

        <div className="space-y-1">
          <dt className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
            {m.settings_reminders_follow_up_label()}
          </dt>
          <dd className="text-sm leading-6 text-foreground">
            {reminderPreference.zakatDueFollowUpEnabled
              ? m.settings_reminders_follow_up_enabled()
              : m.settings_reminders_follow_up_disabled()}
          </dd>
        </div>
      </dl>
    </Surface>
  )
}
