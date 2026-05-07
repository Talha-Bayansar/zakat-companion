import type { HTMLAttributes, ReactNode } from "react"

import { cn } from "@/shared/lib/cn"

function PageSection({
  className,
  ...props
}: HTMLAttributes<HTMLElement>) {
  return (
    <section className={cn("space-y-4 sm:space-y-5", className)} {...props} />
  )
}

function PageKicker({
  className,
  ...props
}: HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p
      className={cn(
        "text-[0.72rem] font-medium uppercase tracking-[0.24em] text-muted-foreground",
        className,
      )}
      {...props}
    />
  )
}

function PageTitle({
  className,
  ...props
}: HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h1
      className={cn(
        "text-2xl font-semibold tracking-tight text-balance sm:text-3xl",
        className,
      )}
      {...props}
    />
  )
}

function PageLead({
  className,
  ...props
}: HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p
      className={cn(
        "max-w-2xl text-sm leading-6 text-muted-foreground sm:text-[0.95rem]",
        className,
      )}
      {...props}
    />
  )
}

function PageHeader({
  className,
  eyebrow,
  title,
  description,
  children,
}: {
  className?: string
  eyebrow?: ReactNode
  title: ReactNode
  description?: ReactNode
  children?: ReactNode
}) {
  return (
    <header className={cn("space-y-2", className)}>
      {eyebrow ? <PageKicker>{eyebrow}</PageKicker> : null}
      <PageTitle>{title}</PageTitle>
      {description ? <PageLead>{description}</PageLead> : null}
      {children}
    </header>
  )
}

export { PageHeader, PageKicker, PageLead, PageSection, PageTitle }
