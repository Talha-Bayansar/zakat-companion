import { createFileRoute } from '@tanstack/react-router'
import { IosAppShell } from '@/components/layout/ios-app-shell'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { m } from '@/paraglide/messages.js'
import { getLocale, locales, setLocale } from '@/paraglide/runtime.js'

export const Route = createFileRoute('/profile/')({
  component: ProfilePage,
})

function localeLabel(locale: (typeof locales)[number]) {
  if (locale === 'tr') return m.language_turkish()
  if (locale === 'nl') return m.language_dutch()
  return m.language_english()
}

function ProfilePage() {
  const activeLocale = getLocale()

  return (
    <IosAppShell title={m.profile_title()} subtitle={m.profile_subtitle()} activeTab="profile">
      <Card className="ios-surface">
        <CardHeader>
          <CardTitle className="ios-section-title">{m.profile_settings_title()}</CardTitle>
          <CardDescription className="ios-copy-muted">{m.profile_settings_body()}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-slate-500">{m.language_label()}</p>
          <Select
            value={activeLocale}
            onValueChange={(next) => {
              setLocale(next as (typeof locales)[number])
            }}
          >
            <SelectTrigger className="ios-input h-11">
              <SelectValue placeholder={m.language_label()} />
            </SelectTrigger>
            <SelectContent className="rounded-2xl">
              {locales.map((locale) => (
                <SelectItem key={locale} value={locale}>
                  {localeLabel(locale)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>
    </IosAppShell>
  )
}
