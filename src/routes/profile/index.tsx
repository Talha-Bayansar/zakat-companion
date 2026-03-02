import { Link, createFileRoute } from '@tanstack/react-router'
import { IosAppShell } from '@/components/layout/ios-app-shell'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { m } from '@/paraglide/messages.js'

export const Route = createFileRoute('/profile/')({
  component: ProfilePage,
})

function ProfilePage() {
  return (
    <IosAppShell title={m.profile_title()} subtitle={m.profile_subtitle()} activeTab="profile">
      <Card className="ios-surface">
        <CardHeader>
          <CardTitle className="ios-section-title">{m.profile_settings_title()}</CardTitle>
          <CardDescription className="ios-copy-muted">{m.profile_settings_body()}</CardDescription>
        </CardHeader>
        <CardContent>
          <Link to="/settings" className="ios-secondary-action w-full justify-between">
            <span>Preferences</span>
            <span aria-hidden>›</span>
          </Link>
        </CardContent>
      </Card>
    </IosAppShell>
  )
}
