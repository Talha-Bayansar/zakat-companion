import { useEffect, useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import {
  baseLocale,
  getLocalePreference,
  locales,
  persistLocale,
  t,
} from '../lib/i18n'

export const Route = createFileRoute('/')({
  component: Home,
})

function Home() {
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
          <span className="eyebrow">{t(locale, 'shell_badge')}</span>
          <h1>{t(locale, 'app_title')}</h1>
          <p>{t(locale, 'app_tagline')}</p>
          <p>{t(locale, 'app_intro')}</p>

          <div className="hero-grid">
            <article className="card">
              <h2>{t(locale, 'auth_card_title')}</h2>
              <p>{t(locale, 'auth_card_body')}</p>
              <div className="button-row">
                <a className="button button-primary" href="#signin">
                  {t(locale, 'auth_primary_cta')}
                </a>
                <a className="button button-secondary" href="#signup">
                  {t(locale, 'auth_secondary_cta')}
                </a>
              </div>
            </article>

            <aside className="card locale-switcher" aria-label={t(locale, 'language_label')}>
              <h2>{t(locale, 'language_label')}</h2>
              <p>{t(locale, 'shell_note')}</p>
              <div className="locale-options">
                {locales.map((candidate) => (
                  <button
                    key={candidate}
                    type="button"
                    className="locale-option"
                    aria-pressed={candidate === locale}
                    onClick={() => {
                      persistLocale(candidate)
                      setLocale(candidate)
                    }}
                  >
                    {candidate === 'en'
                      ? t(locale, 'language_english')
                      : candidate === 'tr'
                        ? t(locale, 'language_turkish')
                        : t(locale, 'language_dutch')}
                  </button>
                ))}
              </div>
            </aside>
          </div>
        </section>
      </main>

      <footer className="shell-footer" aria-label={t(locale, 'primary_navigation_label')}>
        <nav className="bottom-nav">
          <a href="/" aria-current="page">
            {t(locale, 'nav_overview')}
          </a>
          <a href="/history">{t(locale, 'nav_history')}</a>
          <a href="/settings">{t(locale, 'nav_settings')}</a>
        </nav>
      </footer>
    </div>
  )
}
