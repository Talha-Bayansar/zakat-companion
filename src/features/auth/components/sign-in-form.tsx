import { useState } from "react"
import { useNavigate } from "@tanstack/react-router"
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

import { useSignInMutation } from "../lib/auth.mutations"
import {
  createSignInSchema,
  type SignInValues,
} from "../lib/auth.schemas"

type SignInFormProps = {
  redirectTo?: string
}

export function SignInForm({ redirectTo }: SignInFormProps) {
  const navigate = useNavigate()
  const signInMutation = useSignInMutation()
  const [submitError, setSubmitError] = useState<string | null>(null)
  const signInSchema = createSignInSchema({
    invalidEmail: m.auth_validation_invalid_email(),
    requiredPassword: m.auth_validation_required_password(),
  })

  const form = useForm({
    defaultValues: {
      email: "",
      password: "",
    } satisfies SignInValues,
    validators: {
      onSubmit: signInSchema,
    },
    onSubmit: async ({ value }) => {
      setSubmitError(null)

      try {
        await signInMutation.mutateAsync(value)
        await navigate({
          to: redirectTo || "/app",
        })
      } catch {
        setSubmitError(m.auth_sign_in_error())
      }
    },
  })

  return (
    <form
      className="flex flex-col gap-5"
      onSubmit={(event) => {
        event.preventDefault()
        event.stopPropagation()
        void form.handleSubmit()
      }}
    >
      <FieldGroup>
        <form.Field name="email">
          {(field) => {
            const isInvalid =
              form.state.isSubmitted && field.state.meta.errors.length > 0

            return (
              <Field data-invalid={isInvalid ? "" : undefined}>
                <FieldLabel htmlFor={field.name}>{m.auth_email_label()}</FieldLabel>
                <Input
                  id={field.name}
                  type="email"
                  autoComplete="email"
                  inputMode="email"
                  placeholder={m.auth_email_placeholder()}
                  value={field.state.value}
                  onChange={(event) => field.handleChange(event.target.value)}
                  aria-invalid={isInvalid}
                />
                <FieldDescription>
                  {m.auth_email_description()}
                </FieldDescription>
                <FieldError errors={field.state.meta.errors as unknown[]} />
              </Field>
            )
          }}
        </form.Field>

        <form.Field name="password">
          {(field) => {
            const isInvalid =
              form.state.isSubmitted && field.state.meta.errors.length > 0

            return (
              <Field data-invalid={isInvalid ? "" : undefined}>
                <FieldLabel htmlFor={field.name}>{m.auth_password_label()}</FieldLabel>
                <Input
                  id={field.name}
                  type="password"
                  autoComplete="current-password"
                  placeholder={m.auth_password_placeholder()}
                  value={field.state.value}
                  onChange={(event) => field.handleChange(event.target.value)}
                  aria-invalid={isInvalid}
                />
                <FieldDescription>{m.auth_sign_in_password_description()}</FieldDescription>
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
        disabled={form.state.isSubmitting || signInMutation.isPending}
      >
        {form.state.isSubmitting || signInMutation.isPending ? (
          <>
            <Spinner label={m.auth_signing_in()} className="size-4" />
            <span>{m.auth_signing_in()}</span>
          </>
        ) : (
          m.auth_sign_in_cta()
        )}
      </Button>
    </form>
  )
}
