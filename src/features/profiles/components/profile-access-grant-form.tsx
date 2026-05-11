import { useState } from "react"
import { useForm } from "@tanstack/react-form"

import { m } from "@/paraglide/messages"

import { useGrantProfileAccessMutation } from "@/features/profiles"
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

import { createManageProfileAccessSchema } from "../lib/profile-access.schemas"

type ProfileAccessGrantFormProps = {
  profileId: string
}

export function ProfileAccessGrantForm({ profileId }: ProfileAccessGrantFormProps) {
  const grantProfileAccessMutation = useGrantProfileAccessMutation()
  const [accessError, setAccessError] = useState<string | null>(null)

  const accessSchema = createManageProfileAccessSchema({
    requiredEmail: m.settings_profile_access_email_required(),
    invalidEmail: m.settings_profile_access_email_invalid(),
  })

  const form = useForm({
    defaultValues: {
      email: "",
    },
    validators: {
      onSubmit: accessSchema,
    },
    onSubmit: async ({ value }) => {
      setAccessError(null)

      try {
        await grantProfileAccessMutation.mutateAsync({
          profileId,
          email: value.email,
        })
        form.reset()
      } catch (error) {
        setAccessError(
          error instanceof Error && error.message
            ? error.message
            : m.settings_profile_access_grant_error(),
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
        <form.Field name="email">
          {(field) => {
            const isInvalid = form.state.isSubmitted && field.state.meta.errors.length > 0

            return (
              <Field data-invalid={isInvalid ? "" : undefined}>
                <FieldLabel htmlFor={field.name}>
                  {m.settings_profile_access_email_label()}
                </FieldLabel>
                <Input
                  id={field.name}
                  type="email"
                  autoComplete="email"
                  inputMode="email"
                  value={field.state.value}
                  onChange={(event) => field.handleChange(event.target.value)}
                  placeholder={m.settings_profile_access_email_placeholder()}
                  aria-invalid={isInvalid}
                />
                <FieldDescription>
                  {m.settings_profile_access_email_description()}
                </FieldDescription>
                <FieldError errors={field.state.meta.errors as unknown[]} />
              </Field>
            )
          }}
        </form.Field>
      </FieldGroup>

      {accessError ? (
        <p className="rounded-2xl border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm leading-6 text-destructive">
          {accessError}
        </p>
      ) : null}

      <Button
        type="submit"
        className="h-12 w-full rounded-2xl"
        disabled={form.state.isSubmitting || grantProfileAccessMutation.isPending}
      >
        {form.state.isSubmitting || grantProfileAccessMutation.isPending ? (
          <>
            <Spinner label={m.settings_profile_access_granting()} className="size-4" />
            <span>{m.settings_profile_access_granting()}</span>
          </>
        ) : (
          m.settings_profile_access_grant_cta()
        )}
      </Button>
    </form>
  )
}
