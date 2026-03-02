import { createFileRoute } from '@tanstack/react-router'
import { IosAppShell } from '@/components/layout/ios-app-shell'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { m } from '@/paraglide/messages.js'

export const Route = createFileRoute('/profile/')({
  component: ProfilePage,
})

function ProfilePage() {
  return (
    <IosAppShell title={m.profile_title()} subtitle={m.profile_subtitle()} activeTab="profile">
      <Card className="ios-glass-card">
        <CardHeader>
          <CardTitle>{m.profile_settings_title()}</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-slate-600">{m.profile_settings_body()}</CardContent>
      </Card>
    </IosAppShell>
  )
}
