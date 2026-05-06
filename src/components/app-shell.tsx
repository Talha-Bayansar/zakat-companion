import type { ReactNode } from 'react'
import { Link, useNavigate } from '@tanstack/react-router'
import { type Locale, t } from '../lib/i18n'

type SessionUser = {
  email?: string | null
  name?: string | null
}

type SessionShape = {
  user?: SessionUser | null
}

type AppShellProps = {
  locale: Locale
  title: string
  session?: SessionShape | null
  activeTab: 'overview' | 'history' | 'settings'
  onSignOut: () => Promise<void> | void
  children: ReactNode
}

export function AppShell({
  locale,
  title,
  session,
  activeTab,
  onSignOut,
  children,
}: AppShellProps) {
  const navigate = useNavigate()
  const user = session?.user ?? null
  const email = user?.email ?? ''
  const name = user?.name ?? email

  async function signOut() {
    await onSignOut()
    navigate({ to: '/' })
  }

  return (
    <div className="app-shell app-shell-protected">
      <aside className="shell-sidebar">
        <div className="shell-brand">
          <span className="eyebrow">{t(locale, 'shell_badge')}</span>
          <h1>{title}</h1>
          <p>{t(locale, 'shell_note')}</p>
        </div>

        <nav className="shell-nav" aria-label={t(locale, 'primary_navigation_label')}>
          <Link
            className="shell-nav-link"
            to="/app"
            aria-current={activeTab === 'overview' ? 'page' : undefined}
          >
            {t(locale, 'nav_overview')}
          </Link>
          <Link
            className="shell-nav-link"
            to="/app/history"
            aria-current={activeTab === 'history' ? 'page' : undefined}
          >
            {t(locale, 'nav_history')}
          </Link>
          <Link
            className="shell-nav-link"
            to="/app/settings"
            aria-current={activeTab === 'settings' ? 'page' : undefined}
          >
            {t(locale, 'nav_settings')}
          </Link>
        </nav>

        <div className="shell-account">
          <span className="shell-account-label">{t(locale, 'signed_in_label')}</span>
          <strong>{name}</strong>
          <span>{email}</span>
          <button className="button button-secondary shell-signout" type="button" onClick={signOut}>
            {t(locale, 'sign_out')}
          </button>
        </div>
      </aside>

      <main className="shell-main">
        <div className="shell-page">{children}</div>
      </main>

      <footer className="shell-mobile-nav" aria-label={t(locale, 'primary_navigation_label')}>
        <Link to="/app" aria-current={activeTab === 'overview' ? 'page' : undefined}>
          {t(locale, 'nav_overview')}
        </Link>
        <Link to="/app/history" aria-current={activeTab === 'history' ? 'page' : undefined}>
          {t(locale, 'nav_history')}
        </Link>
        <Link to="/app/settings" aria-current={activeTab === 'settings' ? 'page' : undefined}>
          {t(locale, 'nav_settings')}
        </Link>
      </footer>
    </div>
  )
}
