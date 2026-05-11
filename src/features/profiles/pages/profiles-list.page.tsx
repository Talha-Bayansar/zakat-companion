import { Link } from "@tanstack/react-router"
import { HugeiconsIcon } from "@hugeicons/react"
import { Add02Icon } from "@hugeicons/core-free-icons"

import { m } from "@/paraglide/messages"

import { useAccessibleProfilesQuery } from "@/features/profiles"
import { buttonVariants } from "@/shared/ui/button"
import { Empty, EmptyContent, EmptyDescription, EmptyTitle } from "@/shared/ui/empty"
import { ItemGroup } from "@/shared/ui/item"
import { PageHeader, PageSection } from "@/shared/ui/page"
import { Skeleton } from "@/shared/ui/skeleton"

import { ProfileListItem } from "../components/profile-list-item"

export function ProfilesListPage() {
  const profilesQuery = useAccessibleProfilesQuery()
  const profiles = profilesQuery.data ?? []

  return (
    <PageSection className="gap-6">
      <div className="flex items-start justify-between gap-4">
        <PageHeader
          eyebrow={m.profiles_eyebrow()}
          title={m.profiles_title()}
          description={m.profiles_description()}
        />

        <Link
          to="/app/settings/profiles/new"
          aria-label={m.profiles_create_button_label()}
          className={buttonVariants({ variant: "default", size: "icon-sm" })}
        >
          <HugeiconsIcon icon={Add02Icon} strokeWidth={2} className="size-4" />
        </Link>
      </div>

      {profilesQuery.isLoading ? (
        <div className="space-y-3">
          <Skeleton className="h-20 w-full rounded-[1.5rem]" />
          <Skeleton className="h-20 w-full rounded-[1.5rem]" />
          <Skeleton className="h-20 w-full rounded-[1.5rem]" />
        </div>
      ) : profilesQuery.isError ? (
        <p className="rounded-2xl border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm leading-6 text-destructive">
          {profilesQuery.error instanceof Error && profilesQuery.error.message
            ? profilesQuery.error.message
            : m.profiles_list_load_error()}
        </p>
      ) : profiles.length > 0 ? (
        <ItemGroup className="gap-3">
          {profiles.map((profile) => (
            <ProfileListItem key={profile.id} profile={profile} />
          ))}
        </ItemGroup>
      ) : (
        <Empty className="border-border/70 bg-background/80">
          <EmptyContent>
            <EmptyTitle>{m.profiles_empty_title()}</EmptyTitle>
            <EmptyDescription>{m.profiles_empty_description()}</EmptyDescription>
            <Link
              to="/app/settings/profiles/new"
              aria-label={m.profiles_create_button_label()}
              className={buttonVariants({ variant: "default", size: "icon-sm" })}
            >
              <HugeiconsIcon icon={Add02Icon} strokeWidth={2} className="size-4" />
            </Link>
          </EmptyContent>
        </Empty>
      )}
    </PageSection>
  )
}
