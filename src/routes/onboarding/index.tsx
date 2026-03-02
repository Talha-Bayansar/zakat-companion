import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { IosAppShell } from '@/components/layout/ios-app-shell'
import { Button } from '@/components/ui/button'
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { m } from '@/paraglide/messages.js'

type OnboardingValues = {
  displayName: string
  zakatSchool: 'hanafi' | 'standard'
  reminderDay: number
  currency: string
}

export const Route = createFileRoute('/onboarding/')({
  component: OnboardingPage,
})

function OnboardingPage() {
  const [savedState, setSavedState] = useState<OnboardingValues | null>(null)

  const form = useForm<OnboardingValues>({
    defaultValues: {
      displayName: '',
      zakatSchool: 'standard',
      reminderDay: 10,
      currency: 'EUR',
    },
  })

  const handleSubmit = (values: OnboardingValues) => {
    setSavedState(values)
  }

  return (
    <IosAppShell title={m.onboarding_title()} subtitle={m.onboarding_subtitle()} activeTab="dashboard">
      <Card className="rounded-3xl border-white/70 bg-white/80 shadow-[0_10px_30px_rgba(15,23,42,0.08)] backdrop-blur-xl">
        <CardHeader>
          <CardTitle className="text-xl">{m.onboarding_card_title()}</CardTitle>
          <CardDescription>{m.onboarding_card_desc()}</CardDescription>
        </CardHeader>
        <div className="px-6 pb-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-5">
              <FormField
                control={form.control}
                name="displayName"
                rules={{ required: m.onboarding_name_required() }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{m.onboarding_name_label()}</FormLabel>
                    <FormControl>
                      <Input placeholder={m.onboarding_name_placeholder()} className="h-12 rounded-2xl bg-white/70" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="zakatSchool"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{m.onboarding_method_label()}</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="h-12 rounded-2xl bg-white/70">
                          <SelectValue placeholder={m.onboarding_method_placeholder()} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="rounded-2xl">
                        <SelectItem value="standard">{m.onboarding_method_standard()}</SelectItem>
                        <SelectItem value="hanafi">{m.onboarding_method_hanafi()}</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>{m.onboarding_method_hint()}</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-3">
                <FormField
                  control={form.control}
                  name="currency"
                  rules={{ required: m.onboarding_currency_required() }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{m.onboarding_currency_label()}</FormLabel>
                      <FormControl>
                        <Input className="h-12 rounded-2xl bg-white/70 uppercase" maxLength={3} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="reminderDay"
                  rules={{ min: { value: 1, message: m.onboarding_day_min() }, max: { value: 28, message: m.onboarding_day_max() } }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{m.onboarding_day_label()}</FormLabel>
                      <FormControl>
                        <Input
                          className="h-12 rounded-2xl bg-white/70"
                          type="number"
                          min={1}
                          max={28}
                          value={field.value}
                          onChange={(event) => field.onChange(Number(event.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <Button type="submit" className="h-12 w-full rounded-2xl text-base">
                {m.onboarding_save()}
              </Button>
            </form>
          </Form>
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
