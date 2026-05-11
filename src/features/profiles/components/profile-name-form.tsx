import { useState } from "react"
import { useForm } from "@tanstack/react-form"

import { m } from "@/paraglide/messages"

import { Button } from "@/shared/ui/button"
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/shared/ui/field"
import { Input } from "@/shared/ui/input"
import { Spinner } from "@/shared/ui/spinner"

import { createProfileSchema } from "../lib/profile-access.schemas"

type ProfileNameFormProps = {
  initialName: string
  submitLabel: string
  pendingLabel: string
  errorLabel: string
  onSubmit: (name: string) => Promise<void>
  onSuccess?: () => void
}

export function ProfileNameForm({
  initialName,
  submitLabel,
  pendingLabel,
  errorLabel,
  onSubmit,
  onSuccess,
}: ProfileNameFormProps) {
  const [submitError, setSubmitError] = useState<string | null>(null)
  const nameSchema = createProfileSchema({
    requiredName: m.settings_profile_create_name_required(),
    maxNameLength: m.settings_profile_create_name_too_long(),
  })

  const form = useForm({
    defaultValues: {
      name: initialName,
    },
    validators: {
      onSubmit: nameSchema,
    },
    onSubmit: async ({ value }) => {
      setSubmitError(null)

      try {
        await onSubmit(value.name)
        onSuccess?.()
      } catch (error) {
        setSubmitError(
          error instanceof Error && error.message ? error.message : errorLabel,
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
