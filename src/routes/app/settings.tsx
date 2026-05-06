import { createFileRoute } from '@tanstack/react-router'
import { AppShell } from '../../components/app-shell'
import { authClient } from '../../infrastructure/auth/client'
import { useLocale } from '../../lib/use-locale'
import { t } from '../../lib/i18n'
import { requireSession } from '../../lib/server/session'

export const Route = createFileRoute('/app/settings')({
  loader: async () => requireSession(),
  component: SettingsPage,
})

function SettingsPage() {
  const session = Route.useLoaderData()
  const { locale } = useLocale()

  return (
    <AppShell
      locale={locale}
      title={t(locale, 'app_title')}
      session={session}
      activeTab="settings"
      onSignOut={async () => {
        await authClient.signOut()
      }}
    >
      <section className="hero shell-hero">
        <span className="eyebrow">{t(locale, 'nav_settings')}</span>
        <h2>{t(locale, 'settings_page_title')}</h2>
        <p>{t(locale, 'settings_page_note')}</p>
      </section>
    </AppShell>
  )
}
