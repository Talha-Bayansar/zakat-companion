import type { ReactNode } from "react"
import { Link } from "@tanstack/react-router"

import { m } from "@/paraglide/messages"
import { cn } from "@/shared/lib/cn"
import { buttonVariants } from "@/shared/ui/button"
import { Separator } from "@/shared/ui/separator"

type AuthShellProps = {
  title: string
  description: string
  eyebrow: string
  alternateHref: string
  alternateLabel: string
  children: ReactNode
}

export function AuthShell({
  title,
  description,
  eyebrow,
  alternateHref,
  alternateLabel,
  children,
}: AuthShellProps) {
  return (
    <main className="relative min-h-svh overflow-hidden bg-[radial-gradient(circle_at_top_left,rgba(1,72,48,0.14),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(245,158,11,0.08),transparent_30%),linear-gradient(180deg,rgba(248,250,245,1),rgba(255,255,255,1))] px-4 py-8 sm:px-6 lg:px-8">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-56 bg-[linear-gradient(135deg,rgba(1,72,48,0.08),transparent_60%)]" />

      <div className="relative mx-auto flex min-h-svh w-full max-w-md flex-col justify-center">
        <section className="flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            <p className="text-[0.72rem] font-medium uppercase tracking-[0.24em] text-muted-foreground">
              {eyebrow}
            </p>
            <h1 className="text-3xl font-semibold tracking-tight text-balance text-foreground sm:text-4xl">
              {title}
            </h1>
            <p className="text-sm leading-6 text-muted-foreground">
              {description}
            </p>
          </div>

          <div className="flex flex-col gap-5 py-1">
            {children}

            <Separator />

            <div className="flex items-center justify-between gap-3">
              <p className="text-xs leading-5 text-muted-foreground">
                {m.app_name()}
              </p>
              <Link
                to={alternateHref}
                className={cn(
                  buttonVariants({ variant: "ghost", size: "sm" }),
                  "h-9 rounded-full px-4 text-xs",
                )}
              >
                {alternateLabel}
              </Link>
            </div>
          </div>
        </section>
      </div>
    </main>
  )
}
