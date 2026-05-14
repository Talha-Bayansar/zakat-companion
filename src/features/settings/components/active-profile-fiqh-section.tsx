import { Link } from "@tanstack/react-router"

import { m } from "@/paraglide/messages"

import {
  getFiqhMadhabLabel,
  getFiqhNisabBenchmarkLabel,
} from "@/features/fiqh-calculation"
import { useCurrentActiveProfileQuery } from "@/features/profiles"
import { buttonVariants } from "@/shared/ui/button"
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyTitle,
} from "@/shared/ui/empty"
import { Spinner } from "@/shared/ui/spinner"
import { Surface } from "@/shared/ui/surface"

export function ActiveProfileFiqhSection() {
  const currentActiveProfileQuery = useCurrentActiveProfileQuery()

  if (currentActiveProfileQuery.isLoading) {
    return (
      <Surface rounded="xl" padding="lg" className="space-y-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Spinner
            label={m.settings_active_profile_fiqh_loading()}
            className="size-4"
          />
          <span>{m.settings_active_profile_fiqh_loading()}</span>
        </div>
      </Surface>
    )
  }

  if (currentActiveProfileQuery.isError) {
    return (
      <p className="rounded-[1.75rem] border border-destructive/20 bg-destructive/5 px-5 py-4 text-sm leading-6 text-destructive">
        {currentActiveProfileQuery.error instanceof Error &&
        currentActiveProfileQuery.error.message
          ? currentActiveProfileQuery.error.message
          : m.settings_active_profile_fiqh_load_error()}
      </p>
    )
  }

  const activeProfile = currentActiveProfileQuery.data ?? null

  return (
    <Surface rounded="xl" padding="lg" className="space-y-4">
      <div className="flex items-start justify-between gap-4">
        <div className="flex flex-col gap-1">
          <p className="text-sm font-medium text-foreground">
            {m.settings_active_profile_fiqh_title()}
          </p>
          <p className="text-sm leading-6 text-muted-foreground">
            {m.settings_active_profile_fiqh_description()}
          </p>
        </div>

        {activeProfile ? (
          <Link
            to="/app/settings/profiles/$profileId"
            params={{ profileId: activeProfile.id }}
            className={buttonVariants({ variant: "secondary", size: "sm" })}
          >
            {m.settings_active_profile_fiqh_edit_profile()}
          </Link>
        ) : null}
      </div>

      {!activeProfile ? (
        <Empty className="border-border/70 bg-background/80">
          <EmptyContent>
            <EmptyTitle>{m.settings_active_profile_fiqh_empty_title()}</EmptyTitle>
            <EmptyDescription>
              {m.settings_active_profile_fiqh_empty_description()}
            </EmptyDescription>
          </EmptyContent>
        </Empty>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-4 border-b border-border/60 pb-4">
            <div className="flex flex-col gap-1">
              <p className="text-sm font-medium text-foreground">
                {activeProfile.name}
              </p>
            </div>
          </div>

          <dl className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1">
              <dt className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
                {m.settings_active_profile_fiqh_madhab_label()}
              </dt>
              <dd className="text-sm leading-6 text-foreground">
                {getFiqhMadhabLabel(activeProfile.madhab)}
              </dd>
            </div>

            <div className="space-y-1">
              <dt className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
                {m.settings_active_profile_fiqh_nisab_benchmark_label()}
              </dt>
              <dd className="text-sm leading-6 text-foreground">
                {getFiqhNisabBenchmarkLabel(activeProfile.nisabBenchmark)}
              </dd>
            </div>
          </dl>
        </div>
      )}
    </Surface>
  )
}
