import { useEffect, useState } from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import { Delete02Icon } from "@hugeicons/core-free-icons"

import { m } from "@/paraglide/messages"

import { useManagedProfileAccessQuery, useRevokeProfileAccessMutation } from "@/features/profiles"
import { Button } from "@/shared/ui/button"
import { DestructiveConfirmDialog } from "@/shared/ui/destructive-confirm-dialog"
import { Empty, EmptyContent, EmptyDescription, EmptyTitle } from "@/shared/ui/empty"
import { Skeleton } from "@/shared/ui/skeleton"
import { Spinner } from "@/shared/ui/spinner"

type ProfileAccessDelegatesListProps = {
  profileId: string
}

export function ProfileAccessDelegatesList({
  profileId,
}: ProfileAccessDelegatesListProps) {
  const managedAccessQuery = useManagedProfileAccessQuery(profileId)
  const revokeProfileAccessMutation = useRevokeProfileAccessMutation()
  const [accessError, setAccessError] = useState<string | null>(null)
  const managedAccess = managedAccessQuery.data ?? []

  useEffect(() => {
    setAccessError(null)
  }, [profileId])

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-1">
        <p className="text-sm font-medium text-foreground">
          {m.settings_profile_access_revoke_title()}
        </p>
        <p className="text-sm leading-6 text-muted-foreground">
          {m.settings_profile_access_revoke_description()}
        </p>
      </div>

      {managedAccessQuery.isLoading ? (
        <div className="space-y-2">
          <Skeleton className="h-14 w-full" />
          <Skeleton className="h-14 w-full" />
        </div>
      ) : managedAccessQuery.isError ? (
        <p className="rounded-2xl border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm leading-6 text-destructive">
          {m.settings_profile_access_load_error()}
        </p>
      ) : managedAccess.length > 0 ? (
        <div className="flex flex-col gap-2">
          {managedAccess.map((delegate) => (
            <div
              key={delegate.id}
              className="flex items-center justify-between gap-3 rounded-[1.25rem] border border-border/70 bg-background px-4 py-3"
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-foreground">
                  {delegate.userEmail}
                </p>
                <p className="text-xs leading-5 text-muted-foreground">
                  {m.settings_profile_access_delegate_subtitle()}
                </p>
              </div>

              <DestructiveConfirmDialog
                title={m.settings_profile_access_revoke_confirm_title()}
                description={m.settings_profile_access_revoke_confirm_description()}
                confirmLabel={m.settings_profile_access_revoke_confirm_confirm()}
                cancelLabel={m.settings_profile_access_revoke_confirm_cancel()}
                pendingLabel={m.settings_profile_access_revoking()}
                onConfirm={async () => {
                  setAccessError(null)

                  try {
                    await revokeProfileAccessMutation.mutateAsync({
                      profileId,
                      email: delegate.userEmail,
                    })
                  } catch (error) {
                    setAccessError(m.settings_profile_access_revoke_error())
                  }
                }}
                trigger={
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon-sm"
                    className="rounded-2xl"
                    aria-label={m.settings_profile_access_revoke_button_label()}
                    disabled={revokeProfileAccessMutation.isPending}
                  >
                    {revokeProfileAccessMutation.isPending ? (
                      <Spinner
                        label={m.settings_profile_access_revoking()}
                        className="size-4"
                      />
                    ) : (
                      <HugeiconsIcon
                        icon={Delete02Icon}
                        strokeWidth={2}
                        className="size-4"
                      />
                    )}
                  </Button>
                }
              />
            </div>
          ))}
        </div>
      ) : (
        <Empty className="border-border/70 bg-background/80">
          <EmptyContent>
            <EmptyTitle>{m.settings_profile_access_revoke_empty_title()}</EmptyTitle>
            <EmptyDescription>
              {m.settings_profile_access_revoke_empty_description()}
            </EmptyDescription>
          </EmptyContent>
        </Empty>
      )}

      {accessError ? (
        <p className="rounded-2xl border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm leading-6 text-destructive">
          {accessError}
        </p>
      ) : null}
    </div>
  )
}
