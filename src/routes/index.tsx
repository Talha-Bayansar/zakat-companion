import { createFileRoute } from '@tanstack/react-router'
import { Link } from '@tanstack/react-router'
import { LocaleSwitcher } from '../components/locale-switcher'
import { useLocale } from '../lib/use-locale'
import { t } from '../lib/i18n'

export const Route = createFileRoute('/')({
  component: Home,
})

function Home() {
  const { locale, setLocale } = useLocale()

  return (
    <div className="app-shell">
      <main className="page landing-page">
        <section className="hero landing-hero">
          <span className="eyebrow">{t(locale, 'landing_badge')}</span>
          <h1>{t(locale, 'app_title')}</h1>
          <p>{t(locale, 'app_tagline')}</p>
          <p>{t(locale, 'app_intro')}</p>

          <div className="hero-grid">
            <article className="card">
              <h2>{t(locale, 'landing_card_title')}</h2>
              <p>{t(locale, 'landing_card_body')}</p>
              <div className="button-row">
                <Link className="button button-primary" to="/sign-in">
                  {t(locale, 'landing_primary_cta')}
                </Link>
                <Link className="button button-secondary" to="/sign-up">
                  {t(locale, 'landing_secondary_cta')}
                </Link>
              </div>
            </article>

            <LocaleSwitcher locale={locale} setLocale={setLocale} label={t(locale, 'language_label')} />
          </div>
        </section>
      </main>
    </div>
  )
}
