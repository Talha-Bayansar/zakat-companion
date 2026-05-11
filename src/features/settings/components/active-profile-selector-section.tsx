import { useEffect, useState } from "react"
import { Link } from "@tanstack/react-router"

import { m } from "@/paraglide/messages"

import {
  useAccessibleProfilesQuery,
  useSwitchActiveProfileMutation,
  type AccessibleProfile,
} from "@/features/profiles"
import { buttonVariants } from "@/shared/ui/button"
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyTitle,
} from "@/shared/ui/empty"
import { Spinner } from "@/shared/ui/spinner"
import { Surface } from "@/shared/ui/surface"
import { NativeSelect } from "@/shared/ui/native-select"

function profileLabel(profile: AccessibleProfile) {
  return profile.name
}

export function ActiveProfileSelectorSection() {
  const profilesQuery = useAccessibleProfilesQuery()
  const switchProfileMutation = useSwitchActiveProfileMutation()
  const [activeProfileId, setActiveProfileId] = useState<string | null>(null)
  const profiles = profilesQuery.data ?? []
  const activeProfile =
    profiles.find((profile) => profile.id === activeProfileId) ??
    profiles[0] ??
    null

  useEffect(() => {
    if (profiles.length === 0) {
      setActiveProfileId(null)
      return
    }

    if (
      !activeProfileId ||
      !profiles.some((profile) => profile.id === activeProfileId)
    ) {
      setActiveProfileId(profiles[0].id)
    }
  }, [activeProfileId, profiles])

  async function handleChange(profileId: string) {
    const profile = profiles.find((item) => item.id === profileId)

    if (!profile) {
      return
    }

    await switchProfileMutation.mutateAsync(profile.id)
    setActiveProfileId(profile.id)
  }

  if (profilesQuery.isError) {
    return (
      <Surface rounded="xl" padding="lg" className="space-y-4">
        <div className="flex flex-col gap-1">
          <p className="text-sm font-medium text-foreground">
            {m.settings_active_profile_title()}
          </p>
          <p className="text-sm leading-6 text-muted-foreground">
            {m.settings_active_profile_description()}
          </p>
        </div>

        <p className="rounded-2xl border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm leading-6 text-destructive">
          {profilesQuery.error instanceof Error && profilesQuery.error.message
            ? profilesQuery.error.message
            : m.settings_active_profile_load_error()}
        </p>
      </Surface>
    )
  }

  return (
    <Surface rounded="xl" padding="lg" className="space-y-4">
      <div className="flex items-start justify-between gap-4">
        <div className="flex flex-col gap-1">
          <p className="text-sm font-medium text-foreground">
            {m.settings_active_profile_title()}
          </p>
          <p className="text-sm leading-6 text-muted-foreground">
            {m.settings_active_profile_description()}
          </p>
        </div>

        <Link
          to="/app/settings/profiles"
          className={buttonVariants({ variant: "secondary", size: "sm" })}
        >
          {m.settings_active_profile_manage_profiles()}
        </Link>
      </div>

      {profilesQuery.isLoading ? (
        <div className="flex items-center gap-2">
          <Spinner
            label={m.settings_active_profile_loading()}
            className="size-4"
          />
          <span className="text-sm text-muted-foreground">
            {m.settings_active_profile_loading()}
          </span>
        </div>
      ) : profiles.length > 0 ? (
        <div className="flex flex-col gap-3">
          <NativeSelect
            value={activeProfile?.id ?? ""}
            onChange={(event) => {
              void handleChange(event.target.value)
            }}
            disabled={switchProfileMutation.isPending}
            aria-label={m.settings_active_profile_label()}
          >
            {profiles.map((profile) => (
              <option key={profile.id} value={profile.id}>
                {profileLabel(profile)}
              </option>
            ))}
          </NativeSelect>

          <p className="text-xs leading-5 text-muted-foreground">
            {activeProfile
              ? activeProfile.canManageAccess
                ? m.settings_profiles_current_owner_description()
                : m.settings_profiles_current_manager_description()
              : m.settings_active_profile_empty_description()}
          </p>
        </div>
      ) : (
        <Empty className="border-border/70 bg-background/80">
          <EmptyContent>
            <EmptyTitle>{m.settings_active_profile_empty_title()}</EmptyTitle>
            <EmptyDescription>
              {m.settings_active_profile_empty_description()}
            </EmptyDescription>
          </EmptyContent>
        </Empty>
      )}

      {switchProfileMutation.isPending ? (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Spinner
            label={m.settings_active_profile_switching()}
            className="size-4"
          />
          <span>{m.settings_active_profile_switching()}</span>
        </div>
      ) : null}
    </Surface>
  )
}
