import { useState } from 'react'
import { Link, createFileRoute, useNavigate } from '@tanstack/react-router'
import { HugeiconsIcon } from '@hugeicons/react'
import { Alert01Icon, ArrowRight01Icon } from '@hugeicons/core-free-icons'
import { IosAppShell } from '@/components/layout/ios-app-shell'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { authClient } from '@/lib/auth-client'
import { m } from '@/paraglide/messages.js'

export const Route = createFileRoute('/profile/')({
  component: ProfilePage,
})

function ProfilePage() {
  const navigate = useNavigate()
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [isSigningOut, setIsSigningOut] = useState(false)

  async function signOut() {
    setIsSigningOut(true)
    await authClient.signOut()
    await navigate({ to: '/auth/sign-in' })
  }

  return (
    <IosAppShell title={m.profile_title()} subtitle={m.profile_subtitle()} activeTab="profile">
      <Card className="ios-surface">
        <CardHeader>
          <CardTitle className="ios-section-title">{m.profile_settings_title()}</CardTitle>
          <CardDescription className="ios-copy-muted">{m.profile_settings_body()}</CardDescription>
        </CardHeader>
        <CardContent>
          <Link to="/settings" className="ios-secondary-action w-full justify-between">
            <span>Preferences</span>
            <HugeiconsIcon icon={ArrowRight01Icon} strokeWidth={2.2} className="h-5 w-5 text-slate-500" aria-hidden />
          </Link>
        </CardContent>
      </Card>

      <Card className="ios-surface">
        <CardHeader>
          <CardTitle className="ios-section-title">Account</CardTitle>
          <CardDescription className="ios-copy-muted">Danger zone actions.</CardDescription>
        </CardHeader>
        <CardContent>
          <Button type="button" variant="destructive" className="w-full" onClick={() => setConfirmOpen(true)}>
            {m.auth_sign_out()}
          </Button>
        </CardContent>
      </Card>

      {confirmOpen ? (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/45 p-4 sm:items-center" role="dialog" aria-modal="true">
          <Card className="w-full max-w-sm ios-surface">
            <CardHeader>
              <CardTitle className="ios-section-title flex items-center gap-2">
                <HugeiconsIcon icon={Alert01Icon} className="h-5 w-5 text-rose-600" strokeWidth={2.2} />
                Confirm sign out
              </CardTitle>
              <CardDescription className="ios-copy-muted">You will need to sign in again to access your dashboard.</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-2">
              <Button type="button" variant="outline" onClick={() => setConfirmOpen(false)}>
                Cancel
              </Button>
              <Button type="button" variant="destructive" onClick={signOut} loading={isSigningOut} loadingText="Signing out...">
                {m.auth_sign_out()}
              </Button>
            </CardContent>
          </Card>
        </div>
      ) : null}
    </IosAppShell>
  )
}
