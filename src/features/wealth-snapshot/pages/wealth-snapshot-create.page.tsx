import { useNavigate } from "@tanstack/react-router"

import { m } from "@/paraglide/messages"

import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyTitle,
} from "@/shared/ui/empty"
import { PageHeaderWithBack, PageSection } from "@/shared/ui/page"

import { useCurrentActiveProfileQuery } from "@/features/profiles"

import { WealthSnapshotForm } from "../components/wealth-snapshot-form"
import { useReplaceWealthSnapshotMutation } from "../lib/wealth-snapshot.mutations"
import type { WealthSnapshotEntryInput } from "../lib/wealth-snapshot.schemas"

export function WealthSnapshotCreatePage() {
  const navigate = useNavigate()
  const activeProfileQuery = useCurrentActiveProfileQuery()
  const activeProfileId = activeProfileQuery.data?.id ?? null
  const replaceWealthSnapshotMutation = useReplaceWealthSnapshotMutation()
  const isActiveProfileLoading =
    activeProfileQuery.isLoading && activeProfileId === null

  return (
    <PageSection className="gap-6">
      <PageHeaderWithBack
        backTo="/app"
        backLabel={m.wealth_snapshot_create_back()}
        eyebrow={m.wealth_eyebrow()}
        title={m.wealth_snapshot_create_title()}
        description={m.wealth_snapshot_create_description()}
      />

      {isActiveProfileLoading ? (
        <div className="text-sm text-muted-foreground">
          {m.wealth_snapshot_create_title()}
        </div>
      ) : activeProfileId ? (
        <div className="max-w-2xl">
          <p className="text-sm leading-6 text-muted-foreground">
            {m.wealth_surface()}
          </p>

          <div className="pt-5">
            <WealthSnapshotForm
              initialEntries={emptyEntries()}
              submitLabel={m.wealth_snapshot_save_cta()}
              pendingLabel={m.wealth_snapshot_saving()}
              errorLabel={m.wealth_snapshot_save_error()}
              onSubmit={async (entries) => {
                await replaceWealthSnapshotMutation.mutateAsync(entries)
                await navigate({ to: "/app" })
              }}
            />
          </div>
        </div>
      ) : (
        <Empty className="border-border/70 bg-background/80">
          <EmptyContent>
            <EmptyTitle>{m.wealth_snapshot_current_empty_title()}</EmptyTitle>
            <EmptyDescription>
              {m.wealth_snapshot_no_active_profile()}
            </EmptyDescription>
          </EmptyContent>
        </Empty>
      )}
    </PageSection>
  )
}

function emptyEntries() {
  return [
    { category: "cash", amount: "0" },
    { category: "gold", amount: "0" },
    { category: "silver", amount: "0" },
    { category: "trade_inventory", amount: "0" },
    { category: "receivables", amount: "0" },
    { category: "debts_liabilities", amount: "0" },
  ] satisfies WealthSnapshotEntryInput[]
}
