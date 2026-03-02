import { createFileRoute } from '@tanstack/react-router'
import { IosAppShell } from '@/components/layout/ios-app-shell'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export const Route = createFileRoute('/dashboard/')({
  component: DashboardPage,
})

function DashboardPage() {
  return (
    <IosAppShell title="Dashboard" subtitle="See your Zakat position at a glance." activeTab="dashboard">
      <Card className="rounded-3xl border-white/70 bg-white/80">
        <CardHeader>
          <CardTitle>Coming next</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-slate-600">
          Wealth summary cards, nisab tracking, and reminder timeline will live here.
        </CardContent>
      </Card>
    </IosAppShell>
  )
}
