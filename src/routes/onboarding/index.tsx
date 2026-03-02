import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { IosAppShell } from '@/components/layout/ios-app-shell'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
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
    <IosAppShell title="Onboarding" subtitle="Set your Zakat preferences once, then track with clarity." activeTab="dashboard">
      <Card className="rounded-3xl border-white/70 bg-white/80 shadow-[0_10px_30px_rgba(15,23,42,0.08)] backdrop-blur-xl">
        <CardHeader>
          <CardTitle className="text-xl">Personal setup</CardTitle>
          <CardDescription>These defaults will shape your future assessments and reminders.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-5">
              <FormField
                control={form.control}
                name="displayName"
                rules={{ required: 'Please enter your name' }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>What should we call you?</FormLabel>
                    <FormControl>
                      <Input placeholder="Akh Talha" className="h-12 rounded-2xl bg-white/70" {...field} />
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
                    <FormLabel>Nisab method</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="h-12 rounded-2xl bg-white/70">
                          <SelectValue placeholder="Select method" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="rounded-2xl">
                        <SelectItem value="standard">Gold/Silver standard</SelectItem>
                        <SelectItem value="hanafi">Hanafi-friendly minimum</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>Switch anytime in profile settings.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-3">
                <FormField
                  control={form.control}
                  name="currency"
                  rules={{ required: 'Choose a currency' }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Currency</FormLabel>
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
                  rules={{ min: { value: 1, message: 'Min 1' }, max: { value: 28, message: 'Max 28' } }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Reminder day</FormLabel>
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
                Save onboarding
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {savedState ? (
        <Card className="rounded-3xl border-emerald-200 bg-emerald-50/80 shadow-[0_10px_24px_rgba(16,185,129,0.15)]">
          <CardHeader>
            <CardTitle className="text-lg text-emerald-900">Saved locally ✅</CardTitle>
            <CardDescription className="text-emerald-800">
              {savedState.displayName || 'You'} using {savedState.zakatSchool} method, paid in {savedState.currency.toUpperCase()}, reminded on day{' '}
              {savedState.reminderDay}.
            </CardDescription>
          </CardHeader>
        </Card>
      ) : null}
    </IosAppShell>
  )
}
