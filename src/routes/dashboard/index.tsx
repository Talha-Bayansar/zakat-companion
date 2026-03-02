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
      <Card className="ios-surface">
        <CardHeader>
          <CardTitle className="ios-section-title">{m.dashboard_coming_next()}</CardTitle>
        </CardHeader>
        <CardContent className="ios-copy-muted">{m.dashboard_coming_next_body()}</CardContent>
      </Card>
    </IosAppShell>
  )
}
