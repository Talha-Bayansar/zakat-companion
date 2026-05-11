import { useEffect, useState } from "react"

import { m } from "@/paraglide/messages"

import { PageHeader, PageSection } from "@/shared/ui/page"
import { Skeleton } from "@/shared/ui/skeleton"

import { useAccessibleProfilesQuery } from "@/features/profiles"

import { ProfileAccessCard } from "./profile-access-card"
import { ProfileCreateCard } from "./profile-create-card"
import { ProfileDetailsCard } from "./profile-details-card"
import { ProfileSelectorCard } from "./profile-selector-card"

export function ProfilesPageContent() {
  const profilesQuery = useAccessibleProfilesQuery()
  const profiles = profilesQuery.data ?? []
  const [selectedProfileId, setSelectedProfileId] = useState<string | null>(null)

  useEffect(() => {
    if (profiles.length === 0) {
      setSelectedProfileId(null)
      return
    }

    if (!selectedProfileId || !profiles.some((profile) => profile.id === selectedProfileId)) {
      setSelectedProfileId(profiles[0].id)
    }
  }, [profiles, selectedProfileId])

  const selectedProfile =
    profiles.find((profile) => profile.id === selectedProfileId) ?? profiles[0] ?? null

  return (
    <PageSection className="gap-6">
      <PageHeader
        eyebrow={m.profiles_eyebrow()}
        title={m.profiles_title()}
        description={m.profiles_description()}
      />

      {profilesQuery.isLoading ? (
        <div className="grid gap-4 xl:grid-cols-2">
          <Skeleton className="h-40 w-full rounded-[1.75rem]" />
          <Skeleton className="h-40 w-full rounded-[1.75rem]" />
        </div>
      ) : profilesQuery.isError ? (
        <p className="rounded-2xl border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm leading-6 text-destructive">
          {profilesQuery.error instanceof Error && profilesQuery.error.message
            ? profilesQuery.error.message
            : m.settings_profiles_load_error()}
        </p>
      ) : (
        <>
          <div className="grid gap-4 xl:grid-cols-2">
            <ProfileSelectorCard
              profiles={profiles}
              selectedProfileId={selectedProfile?.id ?? null}
              onSelect={(profileId) => setSelectedProfileId(profileId)}
            />
            <ProfileCreateCard onCreated={(profileId) => setSelectedProfileId(profileId)} />
          </div>

          <div className="grid gap-4 xl:grid-cols-2">
            <ProfileDetailsCard profile={selectedProfile} />
            <ProfileAccessCard profile={selectedProfile} />
          </div>
        </>
      )}
    </PageSection>
  )
}
