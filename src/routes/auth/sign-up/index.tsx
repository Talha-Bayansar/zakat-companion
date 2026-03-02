import { Link, createFileRoute } from '@tanstack/react-router'
import { IosAppShell } from '@/components/layout/ios-app-shell'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export const Route = createFileRoute('/auth/sign-up/')({
  component: SignUpPage,
})

function SignUpPage() {
  return (
    <IosAppShell title="Create account" subtitle="Start tracking your Zakat journey." activeTab="home">
      <Card className="rounded-3xl border-white/70 bg-white/80">
        <CardHeader>
          <CardTitle>Auth integration pending</CardTitle>
        </CardHeader>
        <CardContent>
          <Link to="/auth" className="inline-flex rounded-2xl bg-slate-900 px-4 py-2 text-sm text-white">
            Back to auth landing
          </Link>
        </CardContent>
      </Card>
    </IosAppShell>
  )
}
