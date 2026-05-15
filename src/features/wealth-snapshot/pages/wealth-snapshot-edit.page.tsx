import { useNavigate } from "@tanstack/react-router"
import { Link } from "@tanstack/react-router"

import { m } from "@/paraglide/messages"

import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyTitle,
} from "@/shared/ui/empty"
import { buttonVariants } from "@/shared/ui/button"
import { PageHeaderWithBack, PageSection } from "@/shared/ui/page"
import { Spinner } from "@/shared/ui/spinner"
import { Surface } from "@/shared/ui/surface"

import { useCurrentActiveProfileQuery } from "@/features/profiles"

import { WealthSnapshotForm } from "../components/wealth-snapshot-form"
import { useRefreshWealthSnapshotMutation } from "../lib/wealth-snapshot.mutations"
import { useWealthSnapshotQuery } from "../lib/wealth-snapshot.query"

export function WealthSnapshotEditPage() {
  const navigate = useNavigate()
  const activeProfileQuery = useCurrentActiveProfileQuery()
  const activeProfileId = activeProfileQuery.data?.id ?? null
  const currentSnapshotQuery = useWealthSnapshotQuery(activeProfileId)
  const refreshWealthSnapshotMutation = useRefreshWealthSnapshotMutation()
  const isActiveProfileLoading =
    activeProfileQuery.isLoading && activeProfileId === null

  return (
    <PageSection className="gap-6">
      <PageHeaderWithBack
        backTo="/app"
        backLabel={m.wealth_snapshot_edit_back()}
        eyebrow={m.wealth_eyebrow()}
        title={m.wealth_snapshot_edit_title()}
        description={m.wealth_snapshot_edit_description()}
      />

      {isActiveProfileLoading || currentSnapshotQuery.isLoading ? (
        <Surface rounded="xl" padding="lg">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Spinner label={m.wealth_snapshot_edit_loading()} className="size-4" />
            <span>{m.wealth_snapshot_edit_loading()}</span>
          </div>
        </Surface>
      ) : currentSnapshotQuery.isError ? (
        <p className="rounded-2xl border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm leading-6 text-destructive">
          {currentSnapshotQuery.error instanceof Error && currentSnapshotQuery.error.message
            ? currentSnapshotQuery.error.message
            : m.wealth_snapshot_edit_load_error()}
        </p>
      ) : currentSnapshotQuery.data ? (
        <Surface rounded="xl" padding="lg">
          <div className="space-y-5">
            <p className="text-sm leading-6 text-muted-foreground">
              {m.wealth_surface()}
            </p>

            <WealthSnapshotForm
              initialEntries={currentSnapshotQuery.data.entries}
              submitLabel={m.wealth_snapshot_edit_submit_cta()}
              pendingLabel={m.wealth_snapshot_edit_saving()}
              errorLabel={m.wealth_snapshot_edit_error()}
              onSubmit={async (entries) => {
                await refreshWealthSnapshotMutation.mutateAsync(entries)
                await navigate({
                  to: "/app",
                })
              }}
            />

            <p className="text-xs leading-5 text-muted-foreground">
              {m.wealth_snapshot_refresh_warning()}
            </p>
          </div>
        </Surface>
      ) : (
        <Empty className="border-border/70 bg-background/80">
          <EmptyContent>
            <EmptyTitle>{m.wealth_snapshot_edit_not_found_title()}</EmptyTitle>
            <EmptyDescription>
              {m.wealth_snapshot_edit_not_found_description()}
            </EmptyDescription>
            <Link to="/app/wealth-snapshot/new" className={buttonVariants({ variant: "default", size: "sm" })}>
              {m.wealth_snapshot_create_button_label()}
            </Link>
          </EmptyContent>
        </Empty>
      )}
    </PageSection>
  )
}
