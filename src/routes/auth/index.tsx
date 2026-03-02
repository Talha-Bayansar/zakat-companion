import { Link, createFileRoute } from '@tanstack/react-router'
import { IosAppShell } from '@/components/layout/ios-app-shell'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export const Route = createFileRoute('/auth/')({
  component: AuthLandingPage,
})

function AuthLandingPage() {
  return (
    <IosAppShell title="Authentication" subtitle="Securely sign in to sync your Zakat data." activeTab="home">
      <Card className="rounded-3xl border-white/70 bg-white/80">
        <CardHeader>
          <CardTitle>Choose an action</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 text-sm">
          <Link to="/auth/sign-in" className="rounded-2xl bg-slate-900 px-4 py-3 text-white">
            Sign in
          </Link>
          <Link to="/auth/sign-up" className="rounded-2xl bg-white px-4 py-3 text-slate-900 ring-1 ring-slate-200">
            Create account
          </Link>
        </CardContent>
      </Card>
    </IosAppShell>
  )
}
