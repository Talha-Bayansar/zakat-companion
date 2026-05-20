import { useState } from "react"
import { useForm } from "@tanstack/react-form"

import { m } from "@/paraglide/messages"

import {
  type CreateProfileValues,
  type ProfileDetailsFormValues,
  profileDetailsInputSchema,
} from "@/features/profiles/lib/profile-access.schemas"
import {
  getFiqhMadhabLabel,
  getFiqhNisabBenchmarkLabel,
} from "@/features/fiqh-calculation"
import {
  fiqhMadhabCodeValues,
  fiqhNisabBenchmarkCodeValues,
} from "@/features/fiqh-calculation"
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

import { createProfileSchema } from "../lib/profile-access.schemas"

type ProfileDetailsFormProps = {
  initialValues: ProfileDetailsFormValues
  submitLabel: string
  pendingLabel: string
  errorLabel: string
  onSubmit: (values: CreateProfileValues) => Promise<void>
  onSuccess?: () => void
}

const madhabOptions = fiqhMadhabCodeValues.map((value) => ({
  value,
  label: getFiqhMadhabLabel(value),
}))

const nisabBenchmarkOptions = fiqhNisabBenchmarkCodeValues.map((value) => ({
  value,
  label: getFiqhNisabBenchmarkLabel(value),
}))

export function ProfileDetailsForm({
  initialValues,
  submitLabel,
  pendingLabel,
  errorLabel,
  onSubmit,
  onSuccess,
}: ProfileDetailsFormProps) {
  const [submitError, setSubmitError] = useState<string | null>(null)
  const detailsSchema = createProfileSchema({
    requiredName: m.settings_profile_create_name_required(),
    maxNameLength: m.settings_profile_create_name_too_long(),
    requiredMadhab: m.settings_profile_create_madhab_required(),
    requiredNisabBenchmark: m.settings_profile_create_nisab_benchmark_required(),
  })

  const form = useForm({
    defaultValues: initialValues,
    validators: {
      onSubmit: detailsSchema as never,
    },
    onSubmit: async ({ value }) => {
      setSubmitError(null)

      try {
        const parsedValues = profileDetailsInputSchema.parse(value)
        await onSubmit(parsedValues)
        onSuccess?.()
      } catch (error) {
        if (error instanceof Error && error.name === "ZodError") {
          setSubmitError(errorLabel)
          return
        }

        setSubmitError(errorLabel)
      }
    },
  })

  return (
    <form
      className="flex flex-col gap-4"
      onSubmit={(event) => {
        event.preventDefault()
        event.stopPropagation()
        void form.handleSubmit()
      }}
    >
      <FieldGroup>
        <form.Field name="name">
          {(field) => {
            const isInvalid =
              form.state.isSubmitted && field.state.meta.errors.length > 0

            return (
              <Field data-invalid={isInvalid ? "" : undefined}>
                <FieldLabel htmlFor={field.name}>
                  {m.settings_profile_create_name_label()}
                </FieldLabel>
                <Input
                  id={field.name}
                  value={field.state.value}
                  onChange={(event) => field.handleChange(event.target.value)}
                  placeholder={m.settings_profile_create_name_placeholder()}
                  aria-invalid={isInvalid}
                />
                <FieldDescription>
                  {m.settings_profile_create_name_description()}
                </FieldDescription>
                <FieldError errors={field.state.meta.errors as unknown[]} />
              </Field>
            )
          }}
        </form.Field>

        <form.Field name="hawlStartedAt">
          {(field) => {
            const isInvalid =
              form.state.isSubmitted && field.state.meta.errors.length > 0

            return (
              <Field data-invalid={isInvalid ? "" : undefined}>
                <FieldLabel htmlFor={field.name}>
                  {m.settings_profile_create_hawl_started_at_label()}
                </FieldLabel>
                <div className="flex flex-col gap-2">
                  <Input
                    id={field.name}
                    type="date"
                    value={field.state.value}
                    onChange={(event) => field.handleChange(event.target.value)}
                    aria-invalid={isInvalid}
                  />
                  {field.state.value ? (
                    <div className="flex justify-end">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-8 rounded-2xl px-3 text-xs"
                        onClick={() => field.handleChange("")}
                      >
                        {m.settings_profile_create_hawl_started_at_clear()}
                      </Button>
                    </div>
                  ) : null}
                </div>
                <FieldDescription>
                  {m.settings_profile_create_hawl_started_at_description()}
                </FieldDescription>
                <FieldError errors={field.state.meta.errors as unknown[]} />
              </Field>
            )
          }}
        </form.Field>

        <form.Field name="madhab">
          {(field) => {
            const isInvalid =
              form.state.isSubmitted && field.state.meta.errors.length > 0

            return (
              <Field data-invalid={isInvalid ? "" : undefined}>
                <FieldLabel htmlFor={field.name}>
                  {m.settings_profile_create_madhab_label()}
                </FieldLabel>
                <NativeSelect
                  id={field.name}
                  value={field.state.value}
                  onChange={(event) => field.handleChange(event.target.value)}
                  aria-invalid={isInvalid}
                  className="max-w-none"
                >
                  <NativeSelectOption value="" disabled hidden>
                    {m.settings_profile_create_madhab_placeholder()}
                  </NativeSelectOption>
                  {madhabOptions.map((option) => (
                    <NativeSelectOption key={option.value} value={option.value}>
                      {option.label}
                    </NativeSelectOption>
                  ))}
                </NativeSelect>
                <FieldDescription>
                  {m.settings_profile_create_madhab_description()}
                </FieldDescription>
                <FieldError errors={field.state.meta.errors as unknown[]} />
              </Field>
            )
          }}
        </form.Field>

        <form.Field name="nisabBenchmark">
          {(field) => {
            const isInvalid =
              form.state.isSubmitted && field.state.meta.errors.length > 0

            return (
              <Field data-invalid={isInvalid ? "" : undefined}>
                <FieldLabel htmlFor={field.name}>
                  {m.settings_profile_create_nisab_benchmark_label()}
                </FieldLabel>
                <NativeSelect
                  id={field.name}
                  value={field.state.value}
                  onChange={(event) => field.handleChange(event.target.value)}
                  aria-invalid={isInvalid}
                  className="max-w-none"
                >
                  <NativeSelectOption value="" disabled hidden>
                    {m.settings_profile_create_nisab_benchmark_placeholder()}
                  </NativeSelectOption>
                  {nisabBenchmarkOptions.map((option) => (
                    <NativeSelectOption key={option.value} value={option.value}>
                      {option.label}
                    </NativeSelectOption>
                  ))}
                </NativeSelect>
                <FieldDescription>
                  {m.settings_profile_create_nisab_benchmark_description()}
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
        disabled={form.state.isSubmitting}
      >
        {form.state.isSubmitting ? (
          <>
            <Spinner label={pendingLabel} className="size-4" />
            <span>{pendingLabel}</span>
          </>
        ) : (
          submitLabel
        )}
      </Button>
    </form>
  )
}
