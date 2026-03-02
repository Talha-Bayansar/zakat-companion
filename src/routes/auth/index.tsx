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
      <Card className="rounded-3xl border-white/70 bg-white/80">
        <CardHeader>
          <CardTitle>{m.auth_choose_action()}</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 text-sm">
          <Link to="/auth/sign-in" className="rounded-2xl bg-slate-900 px-4 py-3 text-white">
            {m.auth_sign_in()}
          </Link>
          <Link to="/auth/sign-up" className="rounded-2xl bg-white px-4 py-3 text-slate-900 ring-1 ring-slate-200">
            {m.auth_create_account()}
          </Link>
        </CardContent>
      </Card>
    </IosAppShell>
  )
}
