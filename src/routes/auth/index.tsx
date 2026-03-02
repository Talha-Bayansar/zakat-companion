import { Link, createFileRoute } from '@tanstack/react-router'
import { IosAppShell } from '@/components/layout/ios-app-shell'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { m } from '@/paraglide/messages.js'

export const Route = createFileRoute('/auth/')({
  component: AuthLandingPage,
})

function AuthLandingPage() {
  return (
    <IosAppShell title={m.auth_title()} subtitle={m.auth_subtitle()} activeTab="home">
      <Card className="ios-glass-card">
        <CardHeader>
          <CardTitle>{m.auth_choose_action()}</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 text-sm">
          <Link to="/auth/sign-in" className="ios-primary-action">
            {m.auth_sign_in()}
          </Link>
          <Link to="/auth/sign-up" className="ios-secondary-action">
            {m.auth_create_account()}
          </Link>
        </CardContent>
      </Card>
    </IosAppShell>
  )
}
