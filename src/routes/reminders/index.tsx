import { createFileRoute } from '@tanstack/react-router'
import { IosAppShell } from '@/components/layout/ios-app-shell'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export const Route = createFileRoute('/reminders/')({
  component: RemindersPage,
})

function RemindersPage() {
  return (
    <IosAppShell title="Reminders" subtitle="Smart annual and monthly nudges" activeTab="dashboard">
      <Card className="ios-surface">
        <CardHeader>
          <CardTitle className="ios-section-title">Reminder center coming next</CardTitle>
        </CardHeader>
        <CardContent className="ios-copy-muted">
          We’re preparing polished reminder controls here with notification timing, cadence, and regional prayer-aware defaults.
        </CardContent>
      </Card>
    </IosAppShell>
  )
}
