import { Link, createFileRoute } from '@tanstack/react-router'
import { useMemo, useState } from 'react'
import { IosAppShell } from '@/components/layout/ios-app-shell'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { NativeSelect } from '@/components/ui/native-select'
import { getPreferences, savePreferences, type UserPreferences } from '@/features/preferences/model/preferences'
import { m } from '@/paraglide/messages.js'
import { getLocale, locales, setLocale } from '@/paraglide/runtime.js'

export const Route = createFileRoute('/settings/')({
  component: SettingsPage,
})

function localeLabel(locale: (typeof locales)[number]) {
  if (locale === 'tr') return m.language_turkish()
  if (locale === 'nl') return m.language_dutch()
  return m.language_english()
}

function SettingsPage() {
  const activeLocale = getLocale()
  const initialPreferences = useMemo(() => getPreferences(), [])
  const [preferences, setPreferences] = useState<UserPreferences>(initialPreferences)
  const [reminderDayInput, setReminderDayInput] = useState(String(initialPreferences.reminderDay))
  const [saved, setSaved] = useState(false)

  return (
    <IosAppShell title="Preferences" subtitle="Language, reminder, and calculation defaults" activeTab="profile">
      <Card className="ios-surface">
        <CardHeader>
          <CardTitle className="ios-section-title">Language</CardTitle>
          <CardDescription className="ios-copy-muted">Choose your preferred app language.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-slate-500">{m.language_label()}</p>
          <NativeSelect
            aria-label={m.language_label()}
            value={activeLocale}
            onChange={(event) => {
              setLocale(event.target.value as (typeof locales)[number])
            }}
          >
            {locales.map((locale) => (
              <option key={locale} value={locale}>
                {localeLabel(locale)}
              </option>
            ))}
          </NativeSelect>
        </CardContent>
      </Card>

      <Card className="ios-surface">
        <CardHeader>
          <CardTitle className="ios-section-title">Zakat defaults</CardTitle>
          <CardDescription className="ios-copy-muted">Set your preferred defaults for onboarding and future calculations.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-2">
            <Label>{m.onboarding_method_label()}</Label>
            <NativeSelect
              aria-label={m.onboarding_method_label()}
              value={preferences.zakatSchool}
              onChange={(event) =>
                setPreferences((prev) => ({ ...prev, zakatSchool: event.target.value as UserPreferences['zakatSchool'] }))
              }
            >
              <option value="standard">{m.onboarding_method_standard()}</option>
              <option value="hanafi">{m.onboarding_method_hanafi()}</option>
            </NativeSelect>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-2">
              <Label htmlFor="settings-currency">{m.onboarding_currency_label()}</Label>
              <Input
                id="settings-currency"
                className="ios-input uppercase"
                maxLength={3}
                value={preferences.currency}
                onChange={(event) => setPreferences((prev) => ({ ...prev, currency: event.target.value.toUpperCase() }))}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="settings-day">{m.onboarding_day_label()}</Label>
              <Input
                id="settings-day"
                className="ios-input"
                type="number"
                min={1}
                max={28}
                value={reminderDayInput}
                onChange={(event) => {
                  const next = event.target.value
                  setReminderDayInput(next)

                  if (next !== '') {
                    setPreferences((prev) => ({ ...prev, reminderDay: Number(next) }))
                  }
                }}
              />
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="settings-time">Reminder time</Label>
            <Input
              id="settings-time"
              className="ios-input"
              type="time"
              value={preferences.reminderTime}
              onChange={(event) => setPreferences((prev) => ({ ...prev, reminderTime: event.target.value }))}
            />
          </div>

          <label className="flex items-center justify-between rounded-2xl border border-white/70 bg-white/70 px-4 py-3 text-sm">
            <span className="font-medium text-slate-700">Enable notifications</span>
            <input
              type="checkbox"
              className="h-5 w-5 accent-slate-900"
              checked={preferences.notificationsEnabled}
              onChange={(event) => setPreferences((prev) => ({ ...prev, notificationsEnabled: event.target.checked }))}
            />
          </label>

          <Button
            type="button"
            className="h-12 w-full rounded-2xl text-base shadow-[0_10px_24px_rgba(15,23,42,0.2)]"
            onClick={() => {
              const parsedDay = Number(reminderDayInput)
              const normalizedReminderDay = Number.isFinite(parsedDay)
                ? Math.min(28, Math.max(1, parsedDay))
                : 1

              const nextPreferences = {
                ...preferences,
                reminderDay: normalizedReminderDay,
              }

              setPreferences(nextPreferences)
              setReminderDayInput(String(normalizedReminderDay))
              savePreferences(nextPreferences)
              setSaved(true)
              window.setTimeout(() => setSaved(false), 1500)
            }}
          >
            {saved ? 'Saved' : 'Save preferences'}
          </Button>
        </CardContent>
      </Card>

      <Link to="/profile" className="ios-secondary-action">
        Back to Profile
      </Link>
    </IosAppShell>
  )
}
