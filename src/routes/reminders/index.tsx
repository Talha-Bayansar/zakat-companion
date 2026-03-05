import { createFileRoute } from '@tanstack/react-router'
import { IosAppShell } from '@/components/layout/ios-app-shell'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { AuthWrapper } from '@/features/auth/components/auth-wrapper'
import { m } from '@/paraglide/messages.js'

export const Route = createFileRoute('/reminders/')({
  component: RemindersPage,
})

function RemindersPage() {
  return (
    <AuthWrapper>
      <IosAppShell title={m.reminders_title()} subtitle={m.reminders_subtitle()} activeTab="dashboard">
      <Card className="ios-surface">
        <CardHeader>
          <CardTitle className="ios-section-title">{m.reminders_coming_next_title()}</CardTitle>
        </CardHeader>
        <CardContent className="ios-copy-muted">
          {m.reminders_coming_next_body()}
        </CardContent>
      </Card>
      </IosAppShell>
    </AuthWrapper>
  )
}
