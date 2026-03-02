import { Link, createFileRoute } from '@tanstack/react-router'
import { IosAppShell } from '@/components/layout/ios-app-shell'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export const Route = createFileRoute('/')({
  component: HomePage,
})

function HomePage() {
  return (
    <IosAppShell title="Assalamu alaikum" subtitle="Your Zakat, calm and organized." activeTab="home">
      <Card className="rounded-3xl border-white/70 bg-white/80">
        <CardHeader>
          <CardTitle>Quick actions</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 text-sm">
          <Link to="/onboarding" className="rounded-2xl bg-slate-900 px-4 py-3 text-white">
            Start onboarding
          </Link>
          <Link to="/dashboard" className="rounded-2xl bg-white px-4 py-3 text-slate-900 ring-1 ring-slate-200">
            Open dashboard
          </Link>
          <Link to="/auth" className="rounded-2xl bg-white px-4 py-3 text-slate-900 ring-1 ring-slate-200">
            Authentication
          </Link>
        </CardContent>
      </Card>
    </IosAppShell>
  )
}
