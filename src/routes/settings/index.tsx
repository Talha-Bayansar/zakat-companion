import { Link, createFileRoute } from '@tanstack/react-router'
import { useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'
import { IosAppShell } from '@/components/layout/ios-app-shell'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { NativeSelect } from '@/components/ui/native-select'
import { AuthWrapper } from '@/features/auth/components/auth-wrapper'
import { useCurrentUserQuery } from '@/features/auth/api/use-current-user-query'
import { NotificationToggleRow } from '@/features/notifications/components/notification-toggle-row'
import { isPushSubscribed, subscribeToPush, unsubscribeFromPush } from '@/features/notifications/lib/push-client'
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
  const { data: currentUser } = useCurrentUserQuery()

  const [preferences, setPreferences] = useState<UserPreferences>(initialPreferences)
  const [reminderDayInput, setReminderDayInput] = useState(String(initialPreferences.reminderDay))
  const [saved, setSaved] = useState(false)
  const [notificationBusy, setNotificationBusy] = useState(false)
  const [hasPushSubscription, setHasPushSubscription] = useState(false)

  const notificationSupported = typeof window !== 'undefined' && 'Notification' in window && 'serviceWorker' in navigator
  const notificationPermission = typeof window !== 'undefined' && 'Notification' in window ? Notification.permission : 'default'
  const notificationsEnabledEffective = notificationPermission === 'granted' && hasPushSubscription

  useEffect(() => {
    let active = true

    async function syncPushState() {
      if (!notificationSupported) {
        if (active) setHasPushSubscription(false)
        return
      }

      const subscribed = await isPushSubscribed()
      if (!active) return
      setHasPushSubscription(subscribed)

      const shouldEnable = notificationPermission === 'granted' && subscribed
      setPreferences((prev) => {
        if (prev.notificationsEnabled === shouldEnable) return prev
        const next = { ...prev, notificationsEnabled: shouldEnable }
        savePreferences(next)
        return next
      })
    }

    void syncPushState()

    return () => {
      active = false
    }
  }, [notificationSupported, notificationPermission])

  async function enableNotifications() {
    if (!currentUser?.id) {
      toast.error(m.error_session_not_ready())
      return
    }

    if (!notificationSupported) {
      toast.error(m.settings_notifications_unsupported())
      return
    }

    setNotificationBusy(true)
    try {
      await subscribeToPush({ userId: currentUser.id })
      setHasPushSubscription(true)
      setPreferences((prev) => {
        const next = { ...prev, notificationsEnabled: true }
        savePreferences(next)
        return next
      })
      toast.success(m.settings_notifications_enabled_success())
    } catch (error) {
      const message = error instanceof Error ? error.message : 'unknown'
      if (message === 'permission_denied') {
        toast.error(m.settings_notifications_permission_denied())
      } else {
        toast.error(m.settings_notifications_enable_failed())
      }
    } finally {
      setNotificationBusy(false)
    }
  }

  async function disableNotifications() {
    if (!currentUser?.id) {
      toast.error(m.error_session_not_ready())
      return
    }

    setNotificationBusy(true)
    try {
      await unsubscribeFromPush({ userId: currentUser.id })
      setHasPushSubscription(false)
      setPreferences((prev) => {
        const next = { ...prev, notificationsEnabled: false }
        savePreferences(next)
        return next
      })
      toast.success(m.settings_notifications_disabled_success())
    } catch {
      toast.error(m.settings_notifications_disable_failed())
    } finally {
      setNotificationBusy(false)
    }
  }

  return (
    <AuthWrapper>
      <IosAppShell title={m.preferences_title()} subtitle={m.preferences_subtitle()} activeTab="profile">
      <Card className="ios-surface">
        <CardHeader>
          <CardTitle className="ios-section-title">{m.settings_language_title()}</CardTitle>
          <CardDescription className="ios-copy-muted">{m.settings_language_desc()}</CardDescription>
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
          <CardTitle className="ios-section-title">{m.settings_zakat_defaults_title()}</CardTitle>
          <CardDescription className="ios-copy-muted">{m.settings_zakat_defaults_desc()}</CardDescription>
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
            <Label htmlFor="settings-time">{m.settings_reminder_time_label()}</Label>
            <Input
              id="settings-time"
              className="ios-input"
              type="time"
              value={preferences.reminderTime}
              onChange={(event) => setPreferences((prev) => ({ ...prev, reminderTime: event.target.value }))}
            />
          </div>

          <NotificationToggleRow
            label={m.settings_enable_notifications()}
            status={
              notificationSupported
                ? notificationPermission === 'granted'
                  ? m.settings_notification_status_granted()
                  : notificationPermission === 'denied'
                    ? m.settings_notification_status_denied()
                    : m.settings_notification_status_default()
                : m.settings_notification_status_unsupported()
            }
            checked={notificationsEnabledEffective}
            disabled={!currentUser?.id}
            busy={notificationBusy}
            onCheckedChange={(checked) => {
              if (checked) {
                void enableNotifications()
              } else {
                void disableNotifications()
              }
            }}
          />

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
            {saved ? m.common_saved() : m.settings_save_preferences()}
          </Button>
        </CardContent>
      </Card>

      <Link to="/profile" className="ios-secondary-action">
        {m.back_to_profile()}
      </Link>
      </IosAppShell>
    </AuthWrapper>
  )
}
