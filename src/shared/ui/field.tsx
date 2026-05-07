import type { ComponentPropsWithoutRef, HTMLAttributes } from "react"

import { cn } from "@/shared/lib/cn"
import { Label } from "@/shared/ui/label"

function FieldGroup({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      data-slot="field-group"
      className={cn("flex flex-col gap-6", className)}
      {...props}
    />
  )
}

function Field({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      data-slot="field"
      className={cn("flex flex-col gap-2", className)}
      {...props}
    />
  )
}

function FieldLabel({
  className,
  ...props
}: ComponentPropsWithoutRef<typeof Label>) {
  return (
    <Label
      data-slot="field-label"
      className={cn("text-sm font-medium leading-none", className)}
      {...props}
    />
  )
}

function FieldDescription({
  className,
  ...props
}: HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p
      data-slot="field-description"
      className={cn("text-sm leading-6 text-muted-foreground", className)}
      {...props}
    />
  )
}

function getFirstError(errors: unknown[]) {
  const error = errors[0]

  if (typeof error === "string") {
    return error
  }

  if (error && typeof error === "object" && "message" in error) {
    const message = (error as { message?: unknown }).message

    if (typeof message === "string") {
      return message
    }
  }

  return undefined
}

function FieldError({
  className,
  errors,
  ...props
}: HTMLAttributes<HTMLParagraphElement> & { errors: unknown[] }) {
  const message = getFirstError(errors)

  if (!message) {
    return null
  }

  return (
    <p
      data-slot="field-error"
      className={cn("text-sm leading-6 text-destructive", className)}
      {...props}
    >
      {message}
    </p>
  )
}

export { Field, FieldDescription, FieldError, FieldGroup, FieldLabel }
