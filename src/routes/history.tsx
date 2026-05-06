import { useEffect, useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { baseLocale, getLocalePreference, t } from '../lib/i18n'

export const Route = createFileRoute('/history')({
  component: HistoryPage,
})

function HistoryPage() {
  const [locale, setLocale] = useState(baseLocale)

  useEffect(() => {
    setLocale(getLocalePreference())
  }, [])

  useEffect(() => {
    document.documentElement.lang = locale
  }, [locale])

  return (
    <div className="app-shell">
      <main className="page">
        <section className="hero">
          <span className="eyebrow">{t(locale, 'nav_history')}</span>
          <h1>{t(locale, 'nav_history')}</h1>
          <p>{t(locale, 'history_page_note')}</p>
        </section>
      </main>

      <footer className="shell-footer" aria-label={t(locale, 'primary_navigation_label')}>
        <nav className="bottom-nav">
          <a href="/">{t(locale, 'nav_overview')}</a>
          <a href="/history" aria-current="page">
            {t(locale, 'nav_history')}
          </a>
          <a href="/settings">{t(locale, 'nav_settings')}</a>
        </nav>
      </footer>
    </div>
  )
}
