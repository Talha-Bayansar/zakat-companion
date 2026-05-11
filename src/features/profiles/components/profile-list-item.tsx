import type { AccessibleProfile } from "@/features/profiles"
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemTitle,
} from "@/shared/ui/item"

import { m } from "@/paraglide/messages"

import { ProfileRowMenu } from "./profile-row-menu"

type ProfileListItemProps = {
  profile: AccessibleProfile
}

function profileRoleLabel(profile: AccessibleProfile) {
  return profile.role === "owner"
    ? m.settings_profiles_owner_badge()
    : m.settings_profiles_manager_badge()
}

export function ProfileListItem({ profile }: ProfileListItemProps) {
  return (
    <Item variant="outline">
      <ItemContent>
        <ItemTitle>{profile.name}</ItemTitle>
        <ItemDescription>
          {profile.canManageAccess
            ? m.settings_profiles_current_owner_description()
            : m.settings_profiles_current_manager_description()}
        </ItemDescription>
      </ItemContent>

      <ItemActions className="ml-auto">
        <span className="rounded-full border border-border/70 bg-muted/20 px-3 py-1 text-xs font-medium text-muted-foreground">
          {profileRoleLabel(profile)}
        </span>
        <ProfileRowMenu profile={profile} />
      </ItemActions>
    </Item>
  )
}
