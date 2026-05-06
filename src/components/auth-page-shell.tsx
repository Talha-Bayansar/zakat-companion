import type { ReactNode } from 'react'
import { Link } from '@tanstack/react-router'
import { LocaleSwitcher } from './locale-switcher'
import { type Locale, t } from '../lib/i18n'

type AuthPageShellProps = {
  locale: Locale
  setLocale: (locale: Locale) => void
  eyebrow: string
  title: string
  description: string
  primaryHref: string
  primaryLabel: string
  secondaryHref: string
  secondaryLabel: string
  children: ReactNode
}

export function AuthPageShell({
  locale,
  setLocale,
  eyebrow,
  title,
  description,
  primaryHref,
  primaryLabel,
  secondaryHref,
  secondaryLabel,
  children,
}: AuthPageShellProps) {
  return (
    <div className="auth-layout">
      <div className="auth-frame">
        <header className="auth-header">
          <div>
            <span className="eyebrow">{eyebrow}</span>
            <h1>{title}</h1>
            <p>{description}</p>
          </div>

          <div className="auth-links">
            <Link className="text-link" to={primaryHref}>
              {primaryLabel}
            </Link>
            <Link className="button button-secondary" to={secondaryHref}>
              {secondaryLabel}
            </Link>
          </div>
        </header>

        <div className="auth-content">{children}</div>

        <LocaleSwitcher locale={locale} setLocale={setLocale} label={t(locale, 'language_label')} />
      </div>
    </div>
  )
}
