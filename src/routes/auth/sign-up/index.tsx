import { Link, createFileRoute, redirect, useNavigate } from '@tanstack/react-router'
import { revalidateLogic, useForm } from '@tanstack/react-form'
import { z } from 'zod'
import { IosAppShell } from '@/components/layout/ios-app-shell'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Field, FieldError, FieldLabel } from '@/components/ui/field'
import { authClient } from '@/lib/auth-client'
import { m } from '@/paraglide/messages.js'

const signUpSchema = z.object({
  name: z.string().trim().min(1),
  email: z.string().email(),
  password: z.string().min(8),
})

export const Route = createFileRoute('/auth/sign-up/')({
  beforeLoad: async () => {
    const session = await authClient.getSession()

    if (session.data) {
      throw redirect({ to: '/dashboard' })
    }
  },
  component: SignUpPage,
})

function fieldError(error: unknown, fallback: string) {
  if (!error) return undefined
  if (typeof error === 'string') return error
  if (error instanceof z.ZodError) return error.issues[0]?.message ?? fallback
  return fallback
}

function SignUpPage() {
  const navigate = useNavigate()

  const form = useForm({
    defaultValues: {
      name: '',
      email: '',
      password: '',
    },
    validationLogic: revalidateLogic({
      mode: 'submit',
      modeAfterSubmission: 'change',
    }),
    validators: {
      onSubmit: signUpSchema,
    },
    onSubmit: async ({ value, formApi }) => {
      const result = await authClient.signUp.email({
        name: value.name,
        email: value.email,
        password: value.password,
      })

      if (result.error) {
        formApi.setFieldMeta('email', (prev) => ({
          ...prev,
          errors: [result.error?.message ?? m.auth_error_sign_up_failed()],
        }))
        return
      }

      await navigate({ to: '/dashboard' })
    },
  })

  return (
    <IosAppShell title={m.signup_title()} subtitle={m.signup_subtitle()} activeTab="home">
      <Card className="ios-surface">
        <CardHeader>
          <CardTitle className="ios-section-title">{m.auth_create_account()}</CardTitle>
        </CardHeader>
        <CardContent>
          <form
            className="grid gap-3"
            onSubmit={(event) => {
              event.preventDefault()
              event.stopPropagation()
              void form.handleSubmit()
            }}
          >
            <form.Field
              name="name"
              validators={{
                onDynamic: z.string().trim().min(1, m.auth_error_name_required()),
              }}
            >
              {(field) => {
                const error = fieldError(field.state.meta.errors[0], m.auth_error_name_required())
                return (
                  <Field>
                    <FieldLabel htmlFor="sign-up-name">{m.auth_name_label()}</FieldLabel>
                    <Input
                      id="sign-up-name"
                      className="ios-input"
                      placeholder={m.auth_name_placeholder()}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                    />
                    <FieldError errors={error ? [error] : []} />
                  </Field>
                )
              }}
            </form.Field>

            <form.Field
              name="email"
              validators={{
                onDynamic: z.string().email(m.auth_error_invalid_email()),
              }}
            >
              {(field) => {
                const error = fieldError(field.state.meta.errors[0], m.auth_error_invalid_email())
                return (
                  <Field>
                    <FieldLabel htmlFor="sign-up-email">{m.auth_email_label()}</FieldLabel>
                    <Input
                      id="sign-up-email"
                      type="email"
                      className="ios-input"
                      placeholder={m.auth_email_placeholder()}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                    />
                    <FieldError errors={error ? [error] : []} />
                  </Field>
                )
              }}
            </form.Field>

            <form.Field
              name="password"
              validators={{
                onDynamic: z.string().min(8, m.auth_error_password_min()),
              }}
            >
              {(field) => {
                const error = fieldError(field.state.meta.errors[0], m.auth_error_password_min())
                return (
                  <Field>
                    <FieldLabel htmlFor="sign-up-password">{m.auth_password_label()}</FieldLabel>
                    <Input
                      id="sign-up-password"
                      type="password"
                      className="ios-input"
                      placeholder={m.auth_password_placeholder()}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                    />
                    <FieldError errors={error ? [error] : []} />
                  </Field>
                )
              }}
            </form.Field>

            <form.Subscribe selector={(state) => [state.isSubmitting]}>
              {([isSubmitting]) => (
                <Button type="submit" className="ios-primary-action" disabled={isSubmitting}>
                  {isSubmitting ? m.auth_creating_account() : m.auth_create_account()}
                </Button>
              )}
            </form.Subscribe>
          </form>

          <div className="mt-4">
            <Link to="/auth/sign-in" className="ios-secondary-action block text-center">
              {m.auth_cta_sign_in()}
            </Link>
          </div>
        </CardContent>
      </Card>
    </IosAppShell>
  )
}
