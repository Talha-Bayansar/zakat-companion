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
      <Card className="rounded-3xl border-white/70 bg-white/80">
        <CardHeader>
          <CardTitle>{m.home_quick_actions()}</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 text-sm">
          <Link to="/onboarding" className="rounded-2xl bg-slate-900 px-4 py-3 text-white">
            {m.home_action_onboarding()}
          </Link>
          <Link to="/dashboard" className="rounded-2xl bg-white px-4 py-3 text-slate-900 ring-1 ring-slate-200">
            {m.home_action_dashboard()}
          </Link>
          <Link to="/auth" className="rounded-2xl bg-white px-4 py-3 text-slate-900 ring-1 ring-slate-200">
            {m.home_action_auth()}
          </Link>
        </CardContent>
      </Card>
    </IosAppShell>
  )
}
