import { useEffect, useRef, useState } from "react"
import { Combobox } from "@base-ui/react/combobox"
import { Link } from "@tanstack/react-router"

import { m } from "@/paraglide/messages"

import {
  useAccessibleProfilesInfiniteQuery,
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
import { InfiniteList } from "@/shared/ui/infinite-list"
import { Spinner } from "@/shared/ui/spinner"
import { Surface } from "@/shared/ui/surface"

export function ActiveProfileSelectorSection() {
  const [search, setSearch] = useState("")
  const hasSearch = search.trim().length > 0
  const profilesQuery = useAccessibleProfilesInfiniteQuery(search)
  const switchProfileMutation = useSwitchActiveProfileMutation()
  const [activeProfile, setActiveProfile] = useState<AccessibleProfile | null>(
    null,
  )
  const [popupElement, setPopupElement] = useState<HTMLDivElement | null>(null)
  const inputRef = useRef<HTMLInputElement | null>(null)

  const profiles = profilesQuery.data?.pages.flatMap((page) => page.items) ?? []

  useEffect(() => {
    if (!activeProfile && profiles.length > 0) {
      setActiveProfile(profiles[0])
    }
  }, [activeProfile, profiles])

  async function handleChange(profile: AccessibleProfile | null) {
    if (!profile) {
      return
    }

    await switchProfileMutation.mutateAsync(profile.id)
    setActiveProfile(profile)
    setSearch("")
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

      <div className="flex flex-col gap-3">
        <Combobox.Root<AccessibleProfile>
          value={activeProfile}
          onValueChange={(value) => {
            void handleChange(value)
          }}
          inputValue={search}
          onInputValueChange={(value) => {
            setSearch(value)
          }}
          filter={null}
          itemToStringLabel={(profile) => profile.name}
          itemToStringValue={(profile) => profile.id}
          isItemEqualToValue={(item, value) => item.id === value.id}
          disabled={switchProfileMutation.isPending}
        >
            <Combobox.Trigger
              className="flex w-full items-center justify-between gap-1.5 rounded-4xl border border-input bg-input/30 px-3 py-2 text-sm whitespace-nowrap transition-colors outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 data-[placeholder]:text-muted-foreground dark:hover:bg-input/50"
              aria-label={m.settings_active_profile_label()}
            >
              <Combobox.Value placeholder={m.settings_active_profile_label()} />
              <span aria-hidden="true" className="ml-2 shrink-0 text-muted-foreground">
                ▾
              </span>
            </Combobox.Trigger>

            <Combobox.Portal>
              <Combobox.Positioner
                className="isolate z-50"
                side="bottom"
                sideOffset={4}
                align="start"
              >
                <Combobox.Popup
                  ref={setPopupElement}
                  initialFocus={inputRef}
                  className="relative isolate z-50 max-h-96 w-(--anchor-width) origin-(--transform-origin) overflow-hidden rounded-2xl bg-popover text-popover-foreground shadow-2xl ring-1 ring-foreground/5"
                >
                  <div className="flex flex-col gap-2 p-2">
                    <Combobox.Input
                      ref={inputRef}
                      placeholder={m.settings_active_profile_search_placeholder()}
                      aria-label={m.settings_active_profile_search_placeholder()}
                      className="h-9 rounded-xl border border-input bg-background px-3 py-2 text-sm outline-none placeholder:text-muted-foreground focus:border-ring focus:ring-[3px] focus:ring-ring/30"
                    />

                    <Combobox.List className="flex flex-col gap-2">
                      <InfiniteList
                        items={profiles}
                        hasMore={Boolean(profilesQuery.hasNextPage)}
                        isLoading={profilesQuery.isLoading}
                        isFetchingNextPage={profilesQuery.isFetchingNextPage}
                        isRefreshing={profilesQuery.isFetching && profiles.length > 0}
                        onLoadMore={() => void profilesQuery.fetchNextPage()}
                        getItemKey={(profile) => profile.id}
                        renderItem={(profile) => (
                          <Combobox.Item
                            value={profile}
                            className="relative flex w-full cursor-default items-center gap-2.5 rounded-xl py-2 pr-8 pl-3 text-sm outline-hidden select-none focus:bg-accent focus:text-accent-foreground data-disabled:pointer-events-none data-disabled:opacity-50"
                          >
                            {profile.name}
                          </Combobox.Item>
                        )}
                        loadingLabel={m.settings_active_profile_loading_more()}
                        loadMoreLabel={m.settings_active_profile_load_more()}
                        className="gap-2"
                        listClassName="gap-1"
                        footerClassName="pt-1"
                        observeRoot={popupElement}
                        refreshState={
                          <div className="flex items-center gap-2 px-3 py-1 text-xs text-muted-foreground">
                            <Spinner
                              label={m.settings_active_profile_loading()}
                              className="size-3.5"
                            />
                            <span>{m.settings_active_profile_loading()}</span>
                          </div>
                        }
                        loadingState={
                          <div className="flex items-center gap-2 px-3 py-4 text-sm text-muted-foreground">
                            <Spinner
                              label={m.settings_active_profile_loading()}
                              className="size-4"
                            />
                            <span>{m.settings_active_profile_loading()}</span>
                          </div>
                        }
                        emptyState={
                          hasSearch ? (
                            <div className="px-3 py-6">
                              <p className="text-sm font-medium text-foreground">
                                {m.settings_active_profile_no_results_title()}
                              </p>
                              <p className="mt-1 text-sm leading-6 text-muted-foreground">
                                {m.settings_active_profile_no_results_description()}
                              </p>
                            </div>
                          ) : (
                            <Empty className="border-border/70 bg-background/80">
                              <EmptyContent>
                                <EmptyTitle>
                                  {m.settings_active_profile_empty_title()}
                                </EmptyTitle>
                                <EmptyDescription>
                                  {m.settings_active_profile_empty_description()}
                                </EmptyDescription>
                              </EmptyContent>
                            </Empty>
                          )
                        }
                      />
                    </Combobox.List>
                  </div>
                </Combobox.Popup>
            </Combobox.Positioner>
          </Combobox.Portal>
        </Combobox.Root>

        <p className="text-xs leading-5 text-muted-foreground">
          {activeProfile
            ? activeProfile.canManageAccess
              ? m.settings_profiles_current_owner_description()
              : m.settings_profiles_current_manager_description()
            : m.settings_active_profile_empty_description()}
        </p>
      </div>

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
