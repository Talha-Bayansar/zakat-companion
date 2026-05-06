import { createFileRoute } from '@tanstack/react-router'
import { AppShell } from '../components/app-shell'
import { authClient } from '../infrastructure/auth/client'
import { useLocale } from '../lib/use-locale'
import { t } from '../lib/i18n'
import { requireSession } from '../lib/server/session'

export const Route = createFileRoute('/app')({
  loader: async () => requireSession(),
  component: AppPage,
})

function AppPage() {
  const session = Route.useLoaderData()
  const { locale } = useLocale()

  return (
    <AppShell
      locale={locale}
      title={t(locale, 'app_title')}
      session={session}
      activeTab="overview"
      onSignOut={async () => {
        await authClient.signOut()
      }}
    >
      <section className="hero shell-hero">
        <span className="eyebrow">{t(locale, 'app_overview_badge')}</span>
        <h2>{t(locale, 'app_overview_title')}</h2>
        <p>{t(locale, 'app_overview_body')}</p>
      </section>
    </AppShell>
  )
}
