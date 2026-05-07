import { createFileRoute } from "@tanstack/react-router"

import { m } from "@/paraglide/messages"
import { AuthShell } from "@/features/auth"
import { SignUpForm } from "@/features/auth/components/sign-up-form"

export const Route = createFileRoute("/sign-up/")({
  validateSearch: (search: Record<string, unknown>) => ({
    redirect: typeof search.redirect === "string" ? search.redirect : undefined,
  }),
  component: SignUpRoute,
})

function SignUpRoute() {
  const { redirect } = Route.useSearch()

  return (
    <AuthShell
      eyebrow={m.auth_eyebrow()}
      title={m.auth_sign_up_title()}
      description={m.auth_sign_up_description()}
      alternateHref="/sign-in"
      alternateLabel={m.auth_sign_in_link()}
    >
      <SignUpForm redirectTo={redirect} />
    </AuthShell>
  )
}

