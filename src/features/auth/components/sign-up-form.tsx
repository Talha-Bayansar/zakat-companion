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

import { useSignUpMutation } from "../lib/auth.mutations"
import {
  createSignUpSchema,
  type SignUpValues,
} from "../lib/auth.schemas"

type SignUpFormProps = {
  redirectTo?: string
}

export function SignUpForm({ redirectTo }: SignUpFormProps) {
  const navigate = useNavigate()
  const signUpMutation = useSignUpMutation()
  const [submitError, setSubmitError] = useState<string | null>(null)
  const signUpSchema = createSignUpSchema({
    invalidEmail: m.auth_validation_invalid_email(),
    requiredPassword: m.auth_validation_required_password(),
    minPasswordLength: m.auth_validation_min_password_length(),
    requiredConfirmPassword: m.auth_validation_required_confirm_password(),
    passwordsDoNotMatch: m.auth_validation_passwords_do_not_match(),
  })

  const form = useForm({
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: "",
    } satisfies SignUpValues,
    validators: {
      onSubmit: signUpSchema,
    },
    onSubmit: async ({ value }) => {
      setSubmitError(null)

      try {
        await signUpMutation.mutateAsync(value)
        await navigate({
          to: redirectTo || "/app",
        })
      } catch {
        setSubmitError(m.auth_sign_up_error())
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
                  autoComplete="new-password"
                  placeholder={m.auth_password_placeholder()}
                  value={field.state.value}
                  onChange={(event) => field.handleChange(event.target.value)}
                  aria-invalid={isInvalid}
                />
                <FieldDescription>{m.auth_sign_up_password_description()}</FieldDescription>
                <FieldError errors={field.state.meta.errors as unknown[]} />
              </Field>
            )
          }}
        </form.Field>

        <form.Field name="confirmPassword">
          {(field) => {
            const isInvalid =
              form.state.isSubmitted && field.state.meta.errors.length > 0

            return (
              <Field data-invalid={isInvalid ? "" : undefined}>
                <FieldLabel htmlFor={field.name}>
                  {m.auth_confirm_password_label()}
                </FieldLabel>
                <Input
                  id={field.name}
                  type="password"
                  autoComplete="new-password"
                  placeholder={m.auth_confirm_password_placeholder()}
                  value={field.state.value}
                  onChange={(event) => field.handleChange(event.target.value)}
                  aria-invalid={isInvalid}
                />
                <FieldDescription>{m.auth_confirm_password_description()}</FieldDescription>
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
        disabled={form.state.isSubmitting || signUpMutation.isPending}
      >
        {form.state.isSubmitting || signUpMutation.isPending ? (
          <>
            <Spinner label={m.auth_creating_account()} className="size-4" />
            <span>{m.auth_creating_account()}</span>
          </>
        ) : (
          m.auth_sign_up_cta()
        )}
      </Button>
    </form>
  )
}
