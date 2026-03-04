import type { PropsWithChildren } from 'react'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'

export function Field({ className, children }: PropsWithChildren<{ className?: string }>) {
  return <div className={cn('grid gap-2', className)}>{children}</div>
}

export function FieldLabel({ className, children, htmlFor }: PropsWithChildren<{ className?: string; htmlFor?: string }>) {
  return (
    <Label htmlFor={htmlFor} className={className}>
      {children}
    </Label>
  )
}

export function FieldDescription({ className, children }: PropsWithChildren<{ className?: string }>) {
  return <p className={cn('text-sm text-muted-foreground', className)}>{children}</p>
}

export function FieldError({ className, errors }: { className?: string; errors?: unknown[] }) {
  const first = errors?.[0]
  if (!first) return null

  const message =
    typeof first === 'string'
      ? first
      : first instanceof Error
        ? first.message
        : 'Invalid value'

  return <p className={cn('text-sm text-destructive', className)}>{message}</p>
}
