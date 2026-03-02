import { Link, createFileRoute } from '@tanstack/react-router'
import { IosAppShell } from '@/components/layout/ios-app-shell'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { m } from '@/paraglide/messages.js'

export const Route = createFileRoute('/auth/sign-in/')({
  component: SignInPage,
})

function SignInPage() {
  return (
    <IosAppShell title={m.signin_title()} subtitle={m.signin_subtitle()} activeTab="home">
      <Card className="ios-surface">
        <CardHeader>
          <CardTitle className="ios-section-title">{m.auth_pending_title()}</CardTitle>
        </CardHeader>
        <CardContent>
          <Link to="/auth" className="ios-primary-action inline-flex px-5">
            {m.auth_back()}
          </Link>
        </CardContent>
      </Card>
    </IosAppShell>
  )
}
