import { Link, createFileRoute } from '@tanstack/react-router'
import { IosAppShell } from '@/components/layout/ios-app-shell'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { m } from '@/paraglide/messages.js'

export const Route = createFileRoute('/')({
  component: HomePage,
})

function HomePage() {
  return (
    <IosAppShell title={m.home_title()} subtitle={m.home_subtitle()} activeTab="home">
      <Card className="ios-surface">
        <CardHeader>
          <CardTitle className="ios-section-title">{m.home_quick_actions()}</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 text-sm">
          <Link to="/onboarding" className="ios-primary-action">
            {m.home_action_onboarding()}
          </Link>
          <Link to="/dashboard" className="ios-secondary-action">
            {m.home_action_dashboard()}
          </Link>
          <Link to="/auth" className="ios-secondary-action">
            {m.home_action_auth()}
          </Link>
        </CardContent>
      </Card>
    </IosAppShell>
  )
}
