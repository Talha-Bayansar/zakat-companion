import { useEffect, useState } from "react"

import { m } from "@/paraglide/messages"

import type { AccessibleProfile } from "@/features/profiles"
import {
  useDeleteProfileMutation,
  useUpdateProfileMutation,
} from "@/features/profiles"
import { Button } from "@/shared/ui/button"
import { DestructiveConfirmDialog } from "@/shared/ui/destructive-confirm-dialog"
import { Empty, EmptyContent, EmptyDescription, EmptyTitle } from "@/shared/ui/empty"
import { Spinner } from "@/shared/ui/spinner"
import { Surface } from "@/shared/ui/surface"

import { ProfileNameForm } from "./profile-name-form"

type ProfileDetailsCardProps = {
  profile: AccessibleProfile | null
}

function profileRoleLabel(profile: AccessibleProfile) {
  return profile.role === "owner"
    ? m.settings_profiles_owner_badge()
    : m.settings_profiles_manager_badge()
}

export function ProfileDetailsCard({ profile }: ProfileDetailsCardProps) {
  const updateProfileMutation = useUpdateProfileMutation()
  const deleteProfileMutation = useDeleteProfileMutation()
  const [deleteError, setDeleteError] = useState<string | null>(null)

  useEffect(() => {
    setDeleteError(null)
  }, [profile?.id])

  if (!profile) {
    return (
      <Surface rounded="xl" padding="lg" className="space-y-4">
        <div className="flex flex-col gap-1">
          <p className="text-sm font-medium text-foreground">
            {m.profiles_details_title()}
          </p>
          <p className="text-sm leading-6 text-muted-foreground">
            {m.profiles_details_description()}
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

  return (
    <Surface rounded="xl" padding="lg" className="space-y-5">
      <div className="flex flex-col gap-1">
        <p className="text-sm font-medium text-foreground">{m.profiles_details_title()}</p>
        <p className="text-sm leading-6 text-muted-foreground">
          {m.profiles_details_description()}
        </p>
      </div>

      <div className="rounded-[1.5rem] border border-border/70 bg-muted/20 p-4">
        <p className="text-base font-medium text-foreground">{profile.name}</p>
        <p className="mt-1 text-sm leading-6 text-muted-foreground">
          {profile.canManageAccess
            ? m.settings_profiles_current_owner_description()
            : m.settings_profiles_current_manager_description()}
        </p>
        <div className="mt-3 inline-flex rounded-full border border-border/70 bg-background px-3 py-1 text-xs font-medium text-muted-foreground">
          {profileRoleLabel(profile)}
        </div>
      </div>

      <ProfileNameForm
        key={profile.id}
        initialName={profile.name}
        submitLabel={m.profiles_details_update_cta()}
        pendingLabel={m.profiles_details_updating()}
        errorLabel={m.profiles_details_update_error()}
        onSubmit={async (name) => {
          await updateProfileMutation.mutateAsync({
            profileId: profile.id,
            name,
          })
        }}
      />

      {profile.canManageAccess ? (
        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-1">
            <p className="text-sm font-medium text-foreground">
              {m.profiles_details_delete_title()}
            </p>
            <p className="text-sm leading-6 text-muted-foreground">
              {m.profiles_details_delete_description()}
            </p>
          </div>

          {deleteError ? (
            <p className="rounded-2xl border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm leading-6 text-destructive">
              {deleteError}
            </p>
          ) : null}

          <DestructiveConfirmDialog
            title={m.profiles_details_delete_confirm_title()}
            description={m.profiles_details_delete_confirm_description()}
            confirmLabel={m.profiles_details_delete_confirm_confirm()}
            cancelLabel={m.profiles_details_delete_confirm_cancel()}
            pendingLabel={m.profiles_details_deleting()}
            onConfirm={async () => {
              setDeleteError(null)

              try {
                await deleteProfileMutation.mutateAsync(profile.id)
              } catch (error) {
                setDeleteError(
                  error instanceof Error && error.message
                    ? error.message
                    : m.profiles_details_delete_error(),
                )
              }
            }}
            trigger={
              <Button
                type="button"
                variant="destructive"
                className="h-12 w-full rounded-2xl"
                disabled={deleteProfileMutation.isPending}
              >
                {deleteProfileMutation.isPending ? (
                  <>
                    <Spinner label={m.profiles_details_deleting()} className="size-4" />
                    <span>{m.profiles_details_deleting()}</span>
                  </>
                ) : (
                  m.profiles_details_delete_cta()
                )}
              </Button>
            }
          />
        </div>
      ) : null}
    </Surface>
  )
}
