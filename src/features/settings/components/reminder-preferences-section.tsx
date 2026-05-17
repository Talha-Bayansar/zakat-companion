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

import {
  ReminderPreferencesForm,
  type ReminderPreferencesFormValues,
} from "./reminder-preferences-form"

function getReminderPreferenceInitialValues(
  preference: ReminderPreferenceRecord,
): ReminderPreferencesFormValues {
  return {
    balanceUpdateCadence: preference.balanceUpdateCadence,
    timezone: preference.timezone,
    quietHoursEnabled: preference.quietHours ? "enabled" : "disabled",
    quietHoursStartTime: preference.quietHours?.startTime ?? "",
    quietHoursEndTime: preference.quietHours?.endTime ?? "",
    zakatDueFollowUpEnabled: preference.zakatDueFollowUpEnabled
      ? "enabled"
      : "disabled",
  }
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
        {currentActiveProfileQuery.error instanceof Error &&
        currentActiveProfileQuery.error.message
          ? currentActiveProfileQuery.error.message
          : m.settings_reminders_load_error()}
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
            {m.settings_reminders_description()}
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
            {m.settings_reminders_description()}
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
        {reminderPreferenceQuery.error instanceof Error &&
        reminderPreferenceQuery.error.message
          ? reminderPreferenceQuery.error.message
          : m.settings_reminders_load_error()}
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
            {m.settings_reminders_description()}
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
      <div className="flex flex-col gap-1">
        <p className="text-sm font-medium text-foreground">
          {m.settings_reminders_title()}
        </p>
        <p className="text-sm leading-6 text-muted-foreground">
          {m.settings_reminders_description()}
        </p>
      </div>

      <ReminderPreferencesForm
        key={activeProfile.id}
        initialValues={getReminderPreferenceInitialValues(reminderPreference)}
      />
    </Surface>
  )
}
