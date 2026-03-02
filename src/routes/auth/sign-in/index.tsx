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
      <Card className="rounded-3xl border-white/70 bg-white/80">
        <CardHeader>
          <CardTitle>{m.auth_pending_title()}</CardTitle>
        </CardHeader>
        <CardContent>
          <Link to="/auth" className="inline-flex rounded-2xl bg-slate-900 px-4 py-2 text-sm text-white">
            {m.auth_back()}
          </Link>
        </CardContent>
      </Card>
    </IosAppShell>
  )
}
