import { useState } from "react"
import { useForm } from "@tanstack/react-form"

import { m } from "@/paraglide/messages"
import {
  type ReminderCadence,
  type ReminderPreference,
  createReminderPreferenceFormSchema,
  reminderPreferenceSchema,
  reminderCadenceValues,
  useUpdateReminderPreferenceMutation,
} from "@/features/reminders"
import { Button } from "@/shared/ui/button"
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/shared/ui/field"
import { Input } from "@/shared/ui/input"
import {
  NativeSelect,
  NativeSelectOption,
} from "@/shared/ui/native-select"
import { Spinner } from "@/shared/ui/spinner"

export type ReminderPreferencesFormValues = {
  balanceUpdateCadence: ReminderCadence
  timezone: string
  quietHoursEnabled: "enabled" | "disabled"
  quietHoursStartTime: string
  quietHoursEndTime: string
  zakatDueFollowUpEnabled: "enabled" | "disabled"
}

type ReminderPreferencesFormProps = {
  initialValues: ReminderPreferencesFormValues
}

function getReminderCadenceOptions() {
  return reminderCadenceValues.map((value) => ({
    value,
    label:
      value === "daily"
        ? m.settings_reminders_cadence_daily()
        : value === "weekly"
          ? m.settings_reminders_cadence_weekly()
          : value === "monthly"
            ? m.settings_reminders_cadence_monthly()
            : m.settings_reminders_cadence_quarterly(),
  }))
}

function toReminderPreference(values: ReminderPreferencesFormValues) {
  const reminderPreference: ReminderPreference = {
    balanceUpdateCadence: values.balanceUpdateCadence,
    timezone: values.timezone.trim(),
    quietHours:
      values.quietHoursEnabled === "enabled"
        ? {
            startTime: values.quietHoursStartTime.trim(),
            endTime: values.quietHoursEndTime.trim(),
          }
        : null,
    zakatDueFollowUpEnabled: values.zakatDueFollowUpEnabled === "enabled",
  }

  return reminderPreferenceSchema.parse(reminderPreference)
}

export function ReminderPreferencesForm({
  initialValues,
}: ReminderPreferencesFormProps) {
  const updateReminderPreferenceMutation =
    useUpdateReminderPreferenceMutation()
  const [submitError, setSubmitError] = useState<string | null>(null)

  const formSchema = createReminderPreferenceFormSchema({
    requiredTimezone: m.settings_reminders_validation_required_timezone(),
    invalidTimezone: m.settings_reminders_validation_invalid_timezone(),
    requiredQuietHoursStartTime:
      m.settings_reminders_validation_required_quiet_hours_start(),
    requiredQuietHoursEndTime:
      m.settings_reminders_validation_required_quiet_hours_end(),
    invalidQuietHoursWindow:
      m.settings_reminders_validation_invalid_quiet_hours_window(),
  })

  const form = useForm({
    defaultValues: initialValues,
    validators: {
      onSubmit: formSchema,
    },
    onSubmit: async ({ value }) => {
      setSubmitError(null)

      try {
        const reminderPreference = toReminderPreference(value)
        await updateReminderPreferenceMutation.mutateAsync(reminderPreference)
      } catch (error) {
        setSubmitError(
          error instanceof Error && error.message
            ? error.message
            : m.settings_reminders_save_error(),
        )
      }
    },
  })

  return (
    <form
      className="flex flex-col gap-4"
      onSubmit={(event) => {
        event.preventDefault()
        event.stopPropagation()
        setSubmitError(null)
        void form.handleSubmit()
      }}
    >
      <FieldGroup>
        <form.Field name="balanceUpdateCadence">
          {(field) => {
            const isInvalid =
              form.state.isSubmitted && field.state.meta.errors.length > 0

            return (
              <Field data-invalid={isInvalid ? "" : undefined}>
                <FieldLabel htmlFor={field.name}>
                  {m.settings_reminders_balance_cadence_label()}
                </FieldLabel>
                <NativeSelect
                  id={field.name}
                  value={field.state.value}
                  onChange={(event) =>
                    field.handleChange(event.target.value as ReminderCadence)
                  }
                  aria-invalid={isInvalid}
                  className="max-w-none"
                >
                  {getReminderCadenceOptions().map((option) => (
                    <NativeSelectOption key={option.value} value={option.value}>
                      {option.label}
                    </NativeSelectOption>
                  ))}
                </NativeSelect>
                <FieldDescription>
                  {m.settings_reminders_balance_cadence_description()}
                </FieldDescription>
                <FieldError errors={field.state.meta.errors as unknown[]} />
              </Field>
            )
          }}
        </form.Field>

        <form.Field name="timezone">
          {(field) => {
            const isInvalid =
              form.state.isSubmitted && field.state.meta.errors.length > 0

            return (
              <Field data-invalid={isInvalid ? "" : undefined}>
                <FieldLabel htmlFor={field.name}>
                  {m.settings_reminders_timezone_label()}
                </FieldLabel>
                <Input
                  id={field.name}
                  value={field.state.value}
                  onChange={(event) => field.handleChange(event.target.value)}
                  placeholder={m.settings_reminders_timezone_placeholder()}
                  aria-invalid={isInvalid}
                />
                <FieldDescription>
                  {m.settings_reminders_timezone_description()}
                </FieldDescription>
                <FieldError errors={field.state.meta.errors as unknown[]} />
              </Field>
            )
          }}
        </form.Field>

        <form.Field name="quietHoursEnabled">
          {(field) => {
            const isInvalid =
              form.state.isSubmitted && field.state.meta.errors.length > 0

            return (
              <Field data-invalid={isInvalid ? "" : undefined}>
                <FieldLabel htmlFor={field.name}>
                  {m.settings_reminders_quiet_hours_label()}
                </FieldLabel>
                <NativeSelect
                  id={field.name}
                  value={field.state.value}
                  onChange={(event) =>
                    field.handleChange(event.target.value as "enabled" | "disabled")
                  }
                  aria-invalid={isInvalid}
                  className="max-w-none"
                >
                  <NativeSelectOption value="enabled">
                    {m.settings_reminders_quiet_hours_enabled()}
                  </NativeSelectOption>
                  <NativeSelectOption value="disabled">
                    {m.settings_reminders_quiet_hours_disabled()}
                  </NativeSelectOption>
                </NativeSelect>
                <FieldDescription>
                  {m.settings_reminders_quiet_hours_description()}
                </FieldDescription>
                <FieldError errors={field.state.meta.errors as unknown[]} />
              </Field>
            )
          }}
        </form.Field>

        {form.state.values.quietHoursEnabled === "enabled" ? (
          <>
            <form.Field name="quietHoursStartTime">
              {(field) => {
                const isInvalid =
                  form.state.isSubmitted && field.state.meta.errors.length > 0

                return (
                  <Field data-invalid={isInvalid ? "" : undefined}>
                    <FieldLabel htmlFor={field.name}>
                      {m.settings_reminders_quiet_hours_start_label()}
                    </FieldLabel>
                    <Input
                      id={field.name}
                      type="time"
                      value={field.state.value}
                      onChange={(event) => field.handleChange(event.target.value)}
                      aria-invalid={isInvalid}
                    />
                    <FieldError errors={field.state.meta.errors as unknown[]} />
                  </Field>
                )
              }}
            </form.Field>

            <form.Field name="quietHoursEndTime">
              {(field) => {
                const isInvalid =
                  form.state.isSubmitted && field.state.meta.errors.length > 0

                return (
                  <Field data-invalid={isInvalid ? "" : undefined}>
                    <FieldLabel htmlFor={field.name}>
                      {m.settings_reminders_quiet_hours_end_label()}
                    </FieldLabel>
                    <Input
                      id={field.name}
                      type="time"
                      value={field.state.value}
                      onChange={(event) => field.handleChange(event.target.value)}
                      aria-invalid={isInvalid}
                    />
                    <FieldError errors={field.state.meta.errors as unknown[]} />
                  </Field>
                )
              }}
            </form.Field>
          </>
        ) : null}

        <form.Field name="zakatDueFollowUpEnabled">
          {(field) => {
            const isInvalid =
              form.state.isSubmitted && field.state.meta.errors.length > 0

            return (
              <Field data-invalid={isInvalid ? "" : undefined}>
                <FieldLabel htmlFor={field.name}>
                  {m.settings_reminders_follow_up_label()}
                </FieldLabel>
                <NativeSelect
                  id={field.name}
                  value={field.state.value}
                  onChange={(event) =>
                    field.handleChange(event.target.value as "enabled" | "disabled")
                  }
                  aria-invalid={isInvalid}
                  className="max-w-none"
                >
                  <NativeSelectOption value="enabled">
                    {m.settings_reminders_follow_up_enabled()}
                  </NativeSelectOption>
                  <NativeSelectOption value="disabled">
                    {m.settings_reminders_follow_up_disabled()}
                  </NativeSelectOption>
                </NativeSelect>
                <FieldDescription>
                  {m.settings_reminders_follow_up_description()}
                </FieldDescription>
                <FieldError errors={field.state.meta.errors as unknown[]} />
              </Field>
            )
          }}
        </form.Field>
      </FieldGroup>

      {submitError ? (
        <p className="rounded-2xl border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm leading-6 text-destructive">
          {submitError}
        </p>
      ) : null}

      <Button
        type="submit"
        className="h-12 w-full rounded-2xl"
        disabled={form.state.isSubmitting || updateReminderPreferenceMutation.isPending}
      >
        {form.state.isSubmitting || updateReminderPreferenceMutation.isPending ? (
          <>
            <Spinner label={m.settings_reminders_saving()} className="size-4" />
            <span>{m.settings_reminders_saving()}</span>
          </>
        ) : (
          m.settings_reminders_submit()
        )}
      </Button>
    </form>
  )
}
