import { m } from "@/paraglide/messages"

import { useCurrentActiveProfileQuery } from "@/features/profiles"
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyTitle,
} from "@/shared/ui/empty"
import { PageHeaderWithBack, PageSection } from "@/shared/ui/page"
import { Spinner } from "@/shared/ui/spinner"
import { Surface } from "@/shared/ui/surface"

import {
  ReminderPreferencesForm,
  type ReminderPreferencesFormValues,
} from "../components/reminder-preferences-form"
import { useReminderPreferenceQuery } from "../lib/reminders.query"
import type { ReminderPreferenceRecord } from "../lib/reminders.types"

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

export function ReminderPreferencesPage() {
  const currentActiveProfileQuery = useCurrentActiveProfileQuery()
  const activeProfile = currentActiveProfileQuery.data ?? null
  const reminderPreferenceQuery = useReminderPreferenceQuery(
    activeProfile?.canManageAccess ? activeProfile.id : null,
  )

  if (currentActiveProfileQuery.isLoading) {
    return (
      <PageSection className="gap-6">
        <PageHeaderWithBack
          backTo="/app/settings"
          backLabel={m.settings_reminders_back()}
          eyebrow={m.settings_eyebrow()}
          title={m.settings_reminders_title()}
          description={m.settings_reminders_description()}
        />

        <Surface rounded="xl" padding="lg">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Spinner label={m.settings_reminders_loading()} className="size-4" />
            <span>{m.settings_reminders_loading()}</span>
          </div>
        </Surface>
      </PageSection>
    )
  }

  if (currentActiveProfileQuery.isError) {
    return (
      <PageSection className="gap-6">
        <PageHeaderWithBack
          backTo="/app/settings"
          backLabel={m.settings_reminders_back()}
          eyebrow={m.settings_eyebrow()}
          title={m.settings_reminders_title()}
          description={m.settings_reminders_description()}
        />

        <p className="rounded-2xl border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm leading-6 text-destructive">
          {m.settings_reminders_load_error()}
        </p>
      </PageSection>
    )
  }

  if (!activeProfile) {
    return (
      <PageSection className="gap-6">
        <PageHeaderWithBack
          backTo="/app/settings"
          backLabel={m.settings_reminders_back()}
          eyebrow={m.settings_eyebrow()}
          title={m.settings_reminders_title()}
          description={m.settings_reminders_description()}
        />

        <Empty className="border-border/70 bg-background/80">
          <EmptyContent>
            <EmptyTitle>{m.settings_reminders_no_active_profile_title()}</EmptyTitle>
            <EmptyDescription>
              {m.settings_reminders_no_active_profile_description()}
            </EmptyDescription>
          </EmptyContent>
        </Empty>
      </PageSection>
    )
  }

  if (!activeProfile.canManageAccess) {
    return (
      <PageSection className="gap-6">
        <PageHeaderWithBack
          backTo="/app/settings"
          backLabel={m.settings_reminders_back()}
          eyebrow={m.settings_eyebrow()}
          title={m.settings_reminders_title()}
          description={m.settings_reminders_description()}
        />

        <Empty className="border-border/70 bg-background/80">
          <EmptyContent>
            <EmptyTitle>{m.settings_reminders_no_active_profile_title()}</EmptyTitle>
            <EmptyDescription>
              {m.settings_reminders_no_active_profile_description()}
            </EmptyDescription>
          </EmptyContent>
        </Empty>
      </PageSection>
    )
  }

  if (reminderPreferenceQuery.isLoading) {
    return (
      <PageSection className="gap-6">
        <PageHeaderWithBack
          backTo="/app/settings"
          backLabel={m.settings_reminders_back()}
          eyebrow={m.settings_eyebrow()}
          title={m.settings_reminders_title()}
          description={m.settings_reminders_description()}
        />

        <Surface rounded="xl" padding="lg">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Spinner label={m.settings_reminders_loading()} className="size-4" />
            <span>{m.settings_reminders_loading()}</span>
          </div>
        </Surface>
      </PageSection>
    )
  }

  if (reminderPreferenceQuery.isError) {
    return (
      <PageSection className="gap-6">
        <PageHeaderWithBack
          backTo="/app/settings"
          backLabel={m.settings_reminders_back()}
          eyebrow={m.settings_eyebrow()}
          title={m.settings_reminders_title()}
          description={m.settings_reminders_description()}
        />

        <p className="rounded-2xl border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm leading-6 text-destructive">
          {m.settings_reminders_load_error()}
        </p>
      </PageSection>
    )
  }

  const reminderPreference = reminderPreferenceQuery.data ?? null

  if (!reminderPreference) {
    return (
      <PageSection className="gap-6">
        <PageHeaderWithBack
          backTo="/app/settings"
          backLabel={m.settings_reminders_back()}
          eyebrow={m.settings_eyebrow()}
          title={m.settings_reminders_title()}
          description={m.settings_reminders_description()}
        />

        <Empty className="border-border/70 bg-background/80">
          <EmptyContent>
            <EmptyTitle>{m.settings_reminders_no_active_profile_title()}</EmptyTitle>
            <EmptyDescription>
              {m.settings_reminders_no_active_profile_description()}
            </EmptyDescription>
          </EmptyContent>
        </Empty>
      </PageSection>
    )
  }

  return (
    <PageSection className="gap-6">
      <PageHeaderWithBack
        backTo="/app/settings"
        backLabel={m.settings_reminders_back()}
        eyebrow={m.settings_eyebrow()}
        title={m.settings_reminders_title()}
        description={m.settings_reminders_description()}
      />

      <Surface rounded="xl" padding="lg">
        <ReminderPreferencesForm
          key={activeProfile.id}
          initialValues={getReminderPreferenceInitialValues(reminderPreference)}
        />
      </Surface>
    </PageSection>
  )
}
