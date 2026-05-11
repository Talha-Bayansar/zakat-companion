import type { HTMLAttributes, ReactNode } from "react"

import { Link } from "@tanstack/react-router"
import { HugeiconsIcon } from "@hugeicons/react"
import { ArrowLeft01Icon } from "@hugeicons/core-free-icons"

import { cn } from "@/shared/lib/cn"
import { buttonVariants } from "@/shared/ui/button"

function PageSection({
  className,
  ...props
}: HTMLAttributes<HTMLElement>) {
  return (
    <section className={cn("flex flex-col gap-4 sm:gap-5", className)} {...props} />
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
    <header className={cn("flex flex-col gap-2", className)}>
      {eyebrow ? <PageKicker>{eyebrow}</PageKicker> : null}
      <PageTitle>{title}</PageTitle>
      {description ? <PageLead>{description}</PageLead> : null}
      {children}
    </header>
  )
}

function PageHeaderWithBack({
  className,
  backTo,
  backLabel,
  eyebrow,
  title,
  description,
  children,
}: {
  className?: string
  backTo: string
  backLabel: string
  eyebrow?: ReactNode
  title: ReactNode
  description?: ReactNode
  children?: ReactNode
}) {
  return (
    <header className={cn("flex flex-col gap-2", className)}>
      {eyebrow ? <PageKicker>{eyebrow}</PageKicker> : null}
      <div className="flex items-center gap-3">
        <Link
          to={backTo}
          className={buttonVariants({ variant: "ghost", size: "icon-sm" })}
          aria-label={backLabel}
        >
          <HugeiconsIcon icon={ArrowLeft01Icon} strokeWidth={2} className="size-4" />
        </Link>
        <PageTitle>{title}</PageTitle>
      </div>
      {description ? <PageLead>{description}</PageLead> : null}
      {children}
    </header>
  )
}

export { PageHeader, PageHeaderWithBack, PageKicker, PageLead, PageSection, PageTitle }
