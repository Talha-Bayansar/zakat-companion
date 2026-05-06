import { useState, type FormEvent } from 'react'
import { createFileRoute, Link, redirect, useNavigate } from '@tanstack/react-router'
import { AuthPageShell } from '../components/auth-page-shell'
import { authClient } from '../infrastructure/auth/client'
import { signInSchema } from '../application/auth/contracts'
import { useLocale } from '../lib/use-locale'
import { t } from '../lib/i18n'
import { getSession } from '../lib/server/session'

export const Route = createFileRoute('/sign-in')({
  loader: async () => {
    const session = await getSession()

    if (session) {
      throw redirect({ to: '/app' })
    }

    return null
  },
  component: SignInPage,
})

function SignInPage() {
  const navigate = useNavigate()
  const { locale, setLocale } = useLocale()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [pending, setPending] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')

    const parsed = signInSchema.safeParse({ email, password })

    if (!parsed.success) {
      const firstIssue = parsed.error.issues[0]
      setError(String(firstIssue?.message ?? t(locale, 'auth_error_invalid')))
      return
    }

    setPending(true)

    const { error: authError } = await authClient.signIn.email({
      email: parsed.data.email,
      password: parsed.data.password,
      rememberMe: true,
      callbackURL: '/app',
    })

    setPending(false)

    if (authError) {
      setError(String(authError.message ?? t(locale, 'auth_error_invalid')))
      return
    }

    navigate({ to: '/app' })
  }

  return (
    <AuthPageShell
      locale={locale}
      setLocale={setLocale}
      eyebrow={t(locale, 'sign_in_eyebrow')}
      title={t(locale, 'sign_in_title')}
      description={t(locale, 'sign_in_description')}
      primaryHref="/"
      primaryLabel={t(locale, 'return_home')}
      secondaryHref="/sign-up"
      secondaryLabel={t(locale, 'sign_up_switch')}
    >
      <form className="auth-form" onSubmit={handleSubmit}>
        <label className="field">
          <span>{t(locale, 'sign_in_email_label')}</span>
          <input
            className="input"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
        </label>

        <label className="field">
          <span>{t(locale, 'sign_in_password_label')}</span>
          <input
            className="input"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
        </label>

        {error ? <p className="form-error">{error}</p> : null}

        <div className="form-actions">
          <button className="button button-primary" type="submit" disabled={pending}>
            {pending ? t(locale, 'auth_submitting') : t(locale, 'sign_in_submit')}
          </button>
          <Link className="text-link" to="/sign-up">
            {t(locale, 'sign_up_switch')}
          </Link>
        </div>
      </form>
    </AuthPageShell>
  )
}
