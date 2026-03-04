import { Link, createFileRoute, redirect, useNavigate } from '@tanstack/react-router'
import { useForm } from '@tanstack/react-form'
import { z } from 'zod'
import { IosAppShell } from '@/components/layout/ios-app-shell'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { authClient } from '@/lib/auth-client'
import { m } from '@/paraglide/messages.js'

const signInSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
})

export const Route = createFileRoute('/auth/sign-in/')({
  beforeLoad: async () => {
    const session = await authClient.getSession()

    if (session.data) {
      throw redirect({ to: '/dashboard' })
    }
  },
  component: SignInPage,
})

function fieldError(error: unknown, fallback: string) {
  if (!error) return undefined
  if (typeof error === 'string') return error
  if (error instanceof z.ZodError) return error.issues[0]?.message ?? fallback
  return fallback
}

function SignInPage() {
  const navigate = useNavigate()

  const form = useForm({
    defaultValues: {
      email: '',
      password: '',
    },
    validators: {
      onSubmit: signInSchema,
    },
    onSubmit: async ({ value, formApi }) => {
      const result = await authClient.signIn.email({
        email: value.email,
        password: value.password,
      })

      if (result.error) {
        formApi.setFieldMeta('password', (prev) => ({
          ...prev,
          errors: [result.error?.message ?? m.auth_error_sign_in_failed()],
        }))
        return
      }

      await navigate({ to: '/dashboard' })
    },
  })

  return (
    <IosAppShell title={m.signin_title()} subtitle={m.signin_subtitle()} activeTab="home">
      <Card className="ios-surface">
        <CardHeader>
          <CardTitle className="ios-section-title">{m.auth_sign_in()}</CardTitle>
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
              name="email"
              validators={{
                onChange: z.string().email(m.auth_error_invalid_email()),
              }}
            >
              {(field) => {
                const error = fieldError(field.state.meta.errors[0], m.auth_error_invalid_email())
                return (
                  <div className="grid gap-2">
                    <Label htmlFor="sign-in-email">{m.auth_email_label()}</Label>
                    <Input
                      id="sign-in-email"
                      type="email"
                      className="ios-input"
                      placeholder={m.auth_email_placeholder()}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                    />
                    {error ? <p className="text-sm text-destructive">{error}</p> : null}
                  </div>
                )
              }}
            </form.Field>

            <form.Field
              name="password"
              validators={{
                onChange: z.string().min(1, m.auth_error_password_required()),
              }}
            >
              {(field) => {
                const error = fieldError(field.state.meta.errors[0], m.auth_error_password_required())
                return (
                  <div className="grid gap-2">
                    <Label htmlFor="sign-in-password">{m.auth_password_label()}</Label>
                    <Input
                      id="sign-in-password"
                      type="password"
                      className="ios-input"
                      placeholder={m.auth_password_placeholder()}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                    />
                    {error ? <p className="text-sm text-destructive">{error}</p> : null}
                  </div>
                )
              }}
            </form.Field>

            <form.Subscribe selector={(state) => [state.isSubmitting]}>
              {([isSubmitting]) => (
                <Button type="submit" className="ios-primary-action" disabled={isSubmitting}>
                  {isSubmitting ? m.auth_signing_in() : m.auth_sign_in()}
                </Button>
              )}
            </form.Subscribe>
          </form>

          <div className="mt-4">
            <Link to="/auth/sign-up" className="ios-secondary-action block text-center">
              {m.auth_cta_create_account()}
            </Link>
          </div>
        </CardContent>
      </Card>
    </IosAppShell>
  )
}
