import { Outlet, createFileRoute, redirect } from "@tanstack/react-router"

import { currentActiveProfileQueryOptions } from "@/features/profiles"
import { isProfileManagementPath } from "@/features/profiles/lib/profile-management-path"
import { authSessionQueryOptions } from "@/features/auth/lib/auth-session.query"
import { AppShell } from "@/shared/layouts/app-shell"
import { AppShellPending } from "@/shared/layouts/app-shell-pending"

export const Route = createFileRoute("/app")({
  loader: async ({ context, location }) => {
    const requestedLocation = `${location.pathname}${location.searchStr}`
    const session = await context.queryClient.ensureQueryData(
      authSessionQueryOptions()
    )

    if (!session) {
      throw redirect({
        to: "/sign-in",
        search: {
          redirect: requestedLocation,
        },
      })
    }

    const activeProfile = await context.queryClient.ensureQueryData(
      currentActiveProfileQueryOptions()
    )

    if (!activeProfile && !isProfileManagementPath(location.pathname)) {
      throw redirect({
        to: "/app/settings/profiles/new",
        search: {
          redirect: requestedLocation,
        },
      })
    }

    return { session, activeProfile }
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
