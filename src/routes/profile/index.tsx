import { createFileRoute } from '@tanstack/react-router'
import { IosAppShell } from '@/components/layout/ios-app-shell'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export const Route = createFileRoute('/profile/')({
  component: ProfilePage,
})

function ProfilePage() {
  return (
    <IosAppShell title="Profile" subtitle="Manage your preferences and defaults." activeTab="profile">
      <Card className="rounded-3xl border-white/70 bg-white/80">
        <CardHeader>
          <CardTitle>Profile settings</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-slate-600">Identity, madhab preferences, and notification settings will be configurable here.</CardContent>
      </Card>
    </IosAppShell>
  )
}
