import { useState, type FormEvent } from 'react'
import { createFileRoute, Link, redirect, useNavigate } from '@tanstack/react-router'
import { AuthPageShell } from '../components/auth-page-shell'
import { authClient } from '../infrastructure/auth/client'
import { signUpSchema } from '../application/auth/contracts'
import { useLocale } from '../lib/use-locale'
import { t } from '../lib/i18n'
import { getSession } from '../lib/server/session'

export const Route = createFileRoute('/sign-up')({
  loader: async () => {
    const session = await getSession()

    if (session) {
      throw redirect({ to: '/app' })
    }

    return null
  },
  component: SignUpPage,
})

function SignUpPage() {
  const navigate = useNavigate()
  const { locale, setLocale } = useLocale()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [pending, setPending] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')

    const parsed = signUpSchema.safeParse({ name, email, password })

    if (!parsed.success) {
      const firstIssue = parsed.error.issues[0]
      setError(String(firstIssue?.message ?? t(locale, 'auth_error_invalid')))
      return
    }

    setPending(true)

    const { error: authError } = await authClient.signUp.email({
      name: parsed.data.name,
      email: parsed.data.email,
      password: parsed.data.password,
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
      eyebrow={t(locale, 'sign_up_eyebrow')}
      title={t(locale, 'sign_up_title')}
      description={t(locale, 'sign_up_description')}
      primaryHref="/"
      primaryLabel={t(locale, 'return_home')}
      secondaryHref="/sign-in"
      secondaryLabel={t(locale, 'sign_in_switch')}
    >
      <form className="auth-form" onSubmit={handleSubmit}>
        <label className="field">
          <span>{t(locale, 'sign_up_name_label')}</span>
          <input
            className="input"
            type="text"
            autoComplete="name"
            value={name}
            onChange={(event) => setName(event.target.value)}
          />
        </label>

        <label className="field">
          <span>{t(locale, 'sign_up_email_label')}</span>
          <input
            className="input"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
        </label>

        <label className="field">
          <span>{t(locale, 'sign_up_password_label')}</span>
          <input
            className="input"
            type="password"
            autoComplete="new-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
        </label>

        {error ? <p className="form-error">{error}</p> : null}

        <div className="form-actions">
          <button className="button button-primary" type="submit" disabled={pending}>
            {pending ? t(locale, 'auth_submitting') : t(locale, 'sign_up_submit')}
          </button>
          <Link className="text-link" to="/sign-in">
            {t(locale, 'sign_in_switch')}
          </Link>
        </div>
      </form>
    </AuthPageShell>
  )
}
