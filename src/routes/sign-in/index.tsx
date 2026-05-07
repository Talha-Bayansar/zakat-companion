import { createFileRoute } from "@tanstack/react-router"

import { m } from "@/paraglide/messages"
import { AuthShell } from "@/features/auth"
import { SignInForm } from "@/features/auth/components/sign-in-form"

export const Route = createFileRoute("/sign-in/")({
  validateSearch: (search: Record<string, unknown>) => ({
    redirect: typeof search.redirect === "string" ? search.redirect : undefined,
  }),
  component: SignInRoute,
})

function SignInRoute() {
  const { redirect } = Route.useSearch()

  return (
    <AuthShell
      eyebrow={m.auth_eyebrow()}
      title={m.auth_sign_in_title()}
      description={m.auth_sign_in_description()}
      alternateHref="/sign-up"
      alternateLabel={m.auth_sign_up_link()}
    >
      <SignInForm redirectTo={redirect} />
    </AuthShell>
  )
}

