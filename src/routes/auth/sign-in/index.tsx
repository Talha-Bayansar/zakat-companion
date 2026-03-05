import { Link, createFileRoute, redirect, useNavigate } from '@tanstack/react-router'
import { useForm } from '@tanstack/react-form'
import { z } from 'zod'
import { IosAppShell } from '@/components/layout/ios-app-shell'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Field, FieldError, FieldLabel } from '@/components/ui/field'
import { authClient } from '@/lib/auth-client'
import { m } from '@/paraglide/messages.js'
import { toast } from 'sonner'
import { useQueryClient } from '@tanstack/react-query'

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
  const queryClient = useQueryClient()

  const form = useForm({
    defaultValues: {
      email: '',
      password: '',
    },
    validators: {
      onSubmit: signInSchema,
    },
    onSubmit: async ({ value, formApi }) => {
      try {
        const result = await authClient.signIn.email({
          email: value.email,
          password: value.password,
        })

        if (result.error) {
          const message = result.error?.message ?? m.auth_error_sign_in_failed()
          formApi.setFieldMeta('password', (prev) => ({
            ...prev,
            errors: [message],
          }))
          toast.error(message)
          return
        }

        await queryClient.invalidateQueries()
        toast.success(m.auth_signed_in_success())
        await navigate({ to: '/dashboard' })
      } catch {
        toast.error(m.error_network_try_again())
      }
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
            >
              {(field) => {
                const error = fieldError(field.state.meta.errors[0], m.auth_error_invalid_email())
                return (
                  <Field>
                    <FieldLabel htmlFor="sign-in-email">{m.auth_email_label()}</FieldLabel>
                    <Input
                      id="sign-in-email"
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
            >
              {(field) => {
                const error = fieldError(field.state.meta.errors[0], m.auth_error_password_required())
                return (
                  <Field>
                    <FieldLabel htmlFor="sign-in-password">{m.auth_password_label()}</FieldLabel>
                    <Input
                      id="sign-in-password"
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
                <Button type="submit" className="ios-primary-action" loading={isSubmitting} loadingText={m.auth_signing_in()}>
                  {m.auth_sign_in()}
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
