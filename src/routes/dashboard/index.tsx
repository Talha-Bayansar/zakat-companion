import { createFileRoute } from '@tanstack/react-router'
import { IosAppShell } from '@/components/layout/ios-app-shell'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { m } from '@/paraglide/messages.js'

export const Route = createFileRoute('/dashboard/')({
  component: DashboardPage,
})

function DashboardPage() {
  return (
    <IosAppShell title={m.dashboard_title()} subtitle={m.dashboard_subtitle()} activeTab="dashboard">
      <Card className="rounded-3xl border-white/70 bg-white/80">
        <CardHeader>
          <CardTitle>{m.dashboard_coming_next()}</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-slate-600">{m.dashboard_coming_next_body()}</CardContent>
      </Card>
    </IosAppShell>
  )
}
