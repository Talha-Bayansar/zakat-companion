import { useState } from "react"
import { useNavigate } from "@tanstack/react-router"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  CursorEdit02Icon,
  Delete02Icon,
  MoreVerticalIcon,
} from "@hugeicons/core-free-icons"

import { m } from "@/paraglide/messages"

import type { AccessibleProfile } from "@/features/profiles"
import { useDeleteProfileMutation } from "@/features/profiles"
import { Button } from "@/shared/ui/button"
import { DestructiveConfirmDialog } from "@/shared/ui/destructive-confirm-dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/shared/ui/dropdown-menu"

type ProfileRowMenuProps = {
  profile: AccessibleProfile
}

export function ProfileRowMenu({ profile }: ProfileRowMenuProps) {
  const navigate = useNavigate()
  const deleteProfileMutation = useDeleteProfileMutation()
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              aria-label={m.profiles_item_menu_label()}
            >
              <HugeiconsIcon icon={MoreVerticalIcon} strokeWidth={2} className="size-4" />
            </Button>
          }
        />
        <DropdownMenuContent align="end">
          <DropdownMenuItem
            onClick={() =>
              void navigate({
                to: "/app/settings/profiles/$profileId",
                params: { profileId: profile.id },
              })
            }
          >
            <HugeiconsIcon icon={CursorEdit02Icon} strokeWidth={2} />
            {m.profiles_item_update()}
          </DropdownMenuItem>
          <DropdownMenuItem
            variant="destructive"
            onClick={() => {
              setDeleteError(null)
              setDeleteOpen(true)
            }}
          >
            <HugeiconsIcon icon={Delete02Icon} strokeWidth={2} />
            {m.profiles_item_delete()}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <DestructiveConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title={m.profiles_delete_confirm_title()}
        description={m.profiles_delete_confirm_description()}
        confirmLabel={m.profiles_delete_confirm_confirm()}
        cancelLabel={m.profiles_delete_confirm_cancel()}
        pendingLabel={m.profiles_deleting()}
        onConfirm={async () => {
          setDeleteError(null)

          try {
            await deleteProfileMutation.mutateAsync(profile.id)
          } catch (error) {
            setDeleteError(m.profiles_delete_error())
          }
        }}
      />

      {deleteError ? (
        <p className="mt-2 rounded-2xl border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm leading-6 text-destructive">
          {deleteError}
        </p>
      ) : null}
    </>
  )
}
