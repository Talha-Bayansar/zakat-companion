import { m } from "@/paraglide/messages"

import { AuthShell } from "../components/auth-shell"
import { GoogleAuthAction } from "../components/google-auth-action"

type AuthPageProps = {
  redirectTo?: string
}

export function AuthPage({ redirectTo }: AuthPageProps) {
  return (
    <AuthShell
      eyebrow={m.auth_eyebrow()}
      title={m.auth_title()}
      description={m.auth_description()}
    >
      <GoogleAuthAction redirectTo={redirectTo} />
    </AuthShell>
  )
}
