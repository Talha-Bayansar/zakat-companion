import { Outlet, createFileRoute, redirect } from "@tanstack/react-router"

import { authSessionQueryOptions } from "@/features/auth/lib/auth-session.query"
import { AppShell } from "@/shared/layouts/app-shell"
import { AppShellPending } from "@/shared/layouts/app-shell-pending"

export const Route = createFileRoute("/app")({
  loader: async ({ context, location }) => {
    const session = await context.queryClient.ensureQueryData(
      authSessionQueryOptions(),
    )

    if (!session) {
      throw redirect({
        to: "/sign-in",
        search: {
          redirect: location.href,
        },
      })
    }

    return { session }
  },
  pendingComponent: AppShellPending,
  component: AppRoute,
})

function AppRoute() {
  return (
    <AppShell>
      <Outlet />
    </AppShell>
  )
}
