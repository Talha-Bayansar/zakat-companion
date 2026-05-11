import { useState, type ReactElement } from "react"

import { Spinner } from "@/shared/ui/spinner"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/shared/ui/alert-dialog"

type DestructiveConfirmDialogProps = {
  trigger?: ReactElement
  title: string
  description: string
  confirmLabel: string
  cancelLabel: string
  pendingLabel: string
  onConfirm: () => Promise<void> | void
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

export function DestructiveConfirmDialog({
  trigger,
  title,
  description,
  confirmLabel,
  cancelLabel,
  pendingLabel,
  onConfirm,
  open: controlledOpen,
  onOpenChange,
}: DestructiveConfirmDialogProps) {
  const [uncontrolledOpen, setUncontrolledOpen] = useState(false)
  const [pending, setPending] = useState(false)
  const isControlled = typeof controlledOpen === "boolean"
  const open = isControlled ? controlledOpen : uncontrolledOpen
  const handleOpenChange = onOpenChange ?? setUncontrolledOpen

  return (
    <AlertDialog open={open} onOpenChange={handleOpenChange}>
      {trigger ? <AlertDialogTrigger render={trigger} /> : null}
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel disabled={pending}>{cancelLabel}</AlertDialogCancel>
          <AlertDialogAction
            variant="destructive"
            disabled={pending}
            onClick={async (event) => {
              event.preventDefault()

              try {
                setPending(true)
                await onConfirm()
                handleOpenChange(false)
              } finally {
                setPending(false)
              }
            }}
          >
            {pending ? (
              <>
                <Spinner label={pendingLabel} className="size-4" />
                <span>{pendingLabel}</span>
              </>
            ) : (
              confirmLabel
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
