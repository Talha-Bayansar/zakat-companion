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
  trigger: ReactElement
  title: string
  description: string
  confirmLabel: string
  cancelLabel: string
  pendingLabel: string
  onConfirm: () => Promise<void> | void
}

export function DestructiveConfirmDialog({
  trigger,
  title,
  description,
  confirmLabel,
  cancelLabel,
  pendingLabel,
  onConfirm,
}: DestructiveConfirmDialogProps) {
  const [open, setOpen] = useState(false)
  const [pending, setPending] = useState(false)

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger render={trigger} />
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
                setOpen(false)
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
