import { m } from "@/paraglide/messages"

import type { AccessibleProfile } from "@/features/profiles"
import { Empty, EmptyContent, EmptyDescription, EmptyTitle } from "@/shared/ui/empty"
import { Surface } from "@/shared/ui/surface"

import { ProfileAccessDelegatesList } from "./profile-access-delegates-list"
import { ProfileAccessGrantForm } from "./profile-access-grant-form"

type ProfileAccessCardProps = {
  profile: AccessibleProfile | null
}

export function ProfileAccessCard({ profile }: ProfileAccessCardProps) {
  if (!profile) {
    return (
      <Surface rounded="xl" padding="lg" className="space-y-4">
        <div className="flex flex-col gap-1">
          <p className="text-sm font-medium text-foreground">
            {m.settings_profile_access_title()}
          </p>
          <p className="text-sm leading-6 text-muted-foreground">
            {m.settings_profile_access_description()}
          </p>
        </div>

        <Empty className="border-border/70 bg-background/80">
          <EmptyContent>
            <EmptyTitle>{m.settings_profiles_empty_title()}</EmptyTitle>
            <EmptyDescription>{m.settings_profiles_empty_description()}</EmptyDescription>
          </EmptyContent>
        </Empty>
      </Surface>
    )
  }

  if (!profile.canManageAccess) {
    return (
      <Surface rounded="xl" padding="lg" className="space-y-4">
        <div className="flex flex-col gap-1">
          <p className="text-sm font-medium text-foreground">
            {m.settings_profile_access_title()}
          </p>
          <p className="text-sm leading-6 text-muted-foreground">
            {m.settings_profile_access_description()}
          </p>
        </div>

        <Empty className="border-border/70 bg-background/80">
          <EmptyContent>
            <EmptyTitle>{m.settings_profile_access_owner_only()}</EmptyTitle>
            <EmptyDescription>
              {m.settings_profile_access_owner_only_description()}
            </EmptyDescription>
          </EmptyContent>
        </Empty>
      </Surface>
    )
  }

  return (
    <Surface rounded="xl" padding="lg" className="space-y-4">
      <div className="flex flex-col gap-1">
        <p className="text-sm font-medium text-foreground">
          {m.settings_profile_access_title()}
        </p>
        <p className="text-sm leading-6 text-muted-foreground">
          {m.settings_profile_access_description()}
        </p>
      </div>

      <ProfileAccessGrantForm profileId={profile.id} />
      <ProfileAccessDelegatesList profileId={profile.id} />
    </Surface>
  )
}
