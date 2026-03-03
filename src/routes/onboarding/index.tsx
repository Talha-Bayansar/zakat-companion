import { createFileRoute } from '@tanstack/react-router'
import { useMemo, useState } from 'react'
import { useForm } from '@tanstack/react-form'
import { z } from 'zod'
import { IosAppShell } from '@/components/layout/ios-app-shell'
import { Button } from '@/components/ui/button'
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { NativeSelect } from '@/components/ui/native-select'
import { getPreferences, savePreferences } from '@/features/preferences/model/preferences'
import { m } from '@/paraglide/messages.js'

type OnboardingValues = {
  displayName: string
  zakatSchool: 'hanafi' | 'standard'
  reminderDay: number
  currency: string
}

const onboardingSchema = z.object({
  displayName: z.string().trim().min(1),
  zakatSchool: z.enum(['hanafi', 'standard']),
  reminderDay: z.number().int().min(1).max(28),
  currency: z.string().trim().length(3),
})

export const Route = createFileRoute('/onboarding/')({
  component: OnboardingPage,
})

function fieldError(error: unknown, fallback: string) {
  if (!error) return undefined
  if (typeof error === 'string') return error
  if (error instanceof z.ZodError) return error.issues[0]?.message ?? fallback
  return fallback
}

function OnboardingPage() {
  const [savedState, setSavedState] = useState<OnboardingValues | null>(null)
  const preferences = useMemo(() => getPreferences(), [])

  const defaultValues: OnboardingValues = {
    displayName: '',
    zakatSchool: preferences.zakatSchool,
    reminderDay: preferences.reminderDay,
    currency: preferences.currency,
  }

  const form = useForm({
    defaultValues,
    validators: {
      onSubmit: onboardingSchema,
    },
    onSubmit: async ({ value }) => {
      savePreferences({
        ...preferences,
        zakatSchool: value.zakatSchool,
        reminderDay: value.reminderDay,
        currency: value.currency,
      })
      setSavedState(value)
    },
  })

  return (
    <IosAppShell title={m.onboarding_title()} subtitle={m.onboarding_subtitle()} activeTab="dashboard">
      <Card className="ios-surface">
        <CardHeader>
          <CardTitle className="ios-section-title">{m.onboarding_card_title()}</CardTitle>
          <CardDescription className="ios-copy-muted">{m.onboarding_card_desc()}</CardDescription>
        </CardHeader>
        <div className="px-6 pb-6">
          <form
            className="space-y-5"
            onSubmit={(event) => {
              event.preventDefault()
              event.stopPropagation()
              void form.handleSubmit()
            }}
          >
            <form.Field
              name="displayName"
              validators={{
                onChange: z.string().trim().min(1, m.onboarding_name_required()),
              }}
            >
              {(field) => {
                const error = fieldError(field.state.meta.errors[0], m.onboarding_name_required())
                return (
                  <div className="grid gap-2">
                    <Label htmlFor="displayName">{m.onboarding_name_label()}</Label>
                    <Input
                      id="displayName"
                      placeholder={m.onboarding_name_placeholder()}
                      className="ios-input"
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(event) => field.handleChange(event.target.value)}
                    />
                    {error ? <p className="text-sm text-destructive">{error}</p> : null}
                  </div>
                )
              }}
            </form.Field>

            <form.Field name="zakatSchool">
              {(field) => (
                <div className="grid gap-2">
                  <Label>{m.onboarding_method_label()}</Label>
                  <NativeSelect
                    aria-label={m.onboarding_method_label()}
                    value={field.state.value}
                    onChange={(event) => field.handleChange(event.target.value as OnboardingValues['zakatSchool'])}
                  >
                    <option value="standard">{m.onboarding_method_standard()}</option>
                    <option value="hanafi">{m.onboarding_method_hanafi()}</option>
                  </NativeSelect>
                  <p className="text-sm text-muted-foreground">{m.onboarding_method_hint()}</p>
                </div>
              )}
            </form.Field>

            <div className="grid grid-cols-2 gap-3">
              <form.Field
                name="currency"
                validators={{
                  onChange: z.string().trim().length(3, m.onboarding_currency_required()),
                }}
              >
                {(field) => {
                  const error = fieldError(field.state.meta.errors[0], m.onboarding_currency_required())
                  return (
                    <div className="grid gap-2">
                      <Label htmlFor="currency">{m.onboarding_currency_label()}</Label>
                      <Input
                        id="currency"
                        className="ios-input uppercase"
                        maxLength={3}
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(event) => field.handleChange(event.target.value.toUpperCase())}
                      />
                      {error ? <p className="text-sm text-destructive">{error}</p> : null}
                    </div>
                  )
                }}
              </form.Field>

              <form.Field
                name="reminderDay"
                validators={{
                  onChange: z.number().int().min(1, m.onboarding_day_min()).max(28, m.onboarding_day_max()),
                }}
              >
                {(field) => {
                  const error = fieldError(field.state.meta.errors[0], m.onboarding_day_min())
                  return (
                    <div className="grid gap-2">
                      <Label htmlFor="reminderDay">{m.onboarding_day_label()}</Label>
                      <Input
                        id="reminderDay"
                        className="ios-input"
                        type="number"
                        min={1}
                        max={28}
                        value={Number.isNaN(field.state.value) ? '' : field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(event) => {
                          const next = event.target.value
                          field.handleChange(next === '' ? Number.NaN : Number(next))
                        }}
                      />
                      {error ? <p className="text-sm text-destructive">{error}</p> : null}
                    </div>
                  )
                }}
              </form.Field>
            </div>

            <Button type="submit" className="h-12 w-full rounded-2xl text-base shadow-[0_10px_24px_rgba(15,23,42,0.2)]">
              {m.onboarding_save()}
            </Button>
          </form>
        </div>
      </Card>

      {savedState ? (
        <Card className="rounded-3xl border-emerald-200 bg-emerald-50/80 shadow-[0_10px_24px_rgba(16,185,129,0.15)]">
          <CardHeader>
            <CardTitle className="text-lg text-emerald-900">{m.onboarding_saved_title()}</CardTitle>
            <CardDescription className="text-emerald-800">
              {m.onboarding_saved_desc({
                name: savedState.displayName || m.onboarding_you(),
                method: savedState.zakatSchool,
                currency: savedState.currency.toUpperCase(),
                day: savedState.reminderDay,
              })}
            </CardDescription>
          </CardHeader>
        </Card>
      ) : null}
    </IosAppShell>
  )
}
