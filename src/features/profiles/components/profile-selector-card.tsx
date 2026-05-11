import { m } from "@/paraglide/messages"

import type { AccessibleProfile } from "@/features/profiles"
import { Spinner } from "@/shared/ui/spinner"
import { Surface } from "@/shared/ui/surface"
import { NativeSelect } from "@/shared/ui/native-select"

type ProfileSelectorCardProps = {
  profiles: AccessibleProfile[]
  selectedProfileId: string | null
  isLoading?: boolean
  isSwitching?: boolean
  onSelect: (profileId: string) => void
}

export function ProfileSelectorCard({
  profiles,
  selectedProfileId,
  isLoading = false,
  isSwitching = false,
  onSelect,
}: ProfileSelectorCardProps) {
  const selectedProfile =
    profiles.find((profile) => profile.id === selectedProfileId) ??
    profiles[0] ??
    null

  return (
    <Surface rounded="xl" padding="lg" className="space-y-4">
      <div className="flex flex-col gap-1">
        <p className="text-sm font-medium text-foreground">
          {m.profiles_selector_title()}
        </p>
        <p className="text-sm leading-6 text-muted-foreground">
          {m.profiles_selector_description()}
        </p>
      </div>

      {isLoading ? (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Spinner label={m.profiles_selector_loading()} className="size-4" />
          <span>{m.profiles_selector_loading()}</span>
        </div>
      ) : (
        <>
          <NativeSelect
            value={selectedProfile?.id ?? ""}
            onChange={(event) => onSelect(event.target.value)}
            disabled={isSwitching || profiles.length === 0}
            aria-label={m.profiles_selector_label()}
          >
            {profiles.map((profile) => (
              <option key={profile.id} value={profile.id}>
                {profile.name}
              </option>
            ))}
          </NativeSelect>

          <p className="text-xs leading-5 text-muted-foreground">
            {selectedProfile
              ? selectedProfile.canManageAccess
                ? m.settings_profiles_current_owner_description()
                : m.settings_profiles_current_manager_description()
              : m.profiles_selector_empty_description()}
          </p>
        </>
      )}
    </Surface>
  )
}
