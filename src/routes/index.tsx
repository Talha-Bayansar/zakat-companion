import { createFileRoute, Link } from "@tanstack/react-router"
import { HugeiconsIcon } from "@hugeicons/react"
import { ArrowRight01Icon } from "@hugeicons/core-free-icons"

import { m } from "@/paraglide/messages"

import { cn } from "@/shared/lib/cn"
import { buttonVariants } from "@/shared/ui/button"

export const Route = createFileRoute("/")({ component: LandingPage })

function LandingPage() {
  return (
    <main className="relative min-h-svh overflow-hidden bg-[radial-gradient(circle_at_top_left,rgba(1,72,48,0.14),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(245,158,11,0.08),transparent_30%),linear-gradient(180deg,rgba(248,250,245,1),rgba(255,255,255,1))]">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-56 bg-[linear-gradient(135deg,rgba(1,72,48,0.08),transparent_60%)]" />

      <div className="relative mx-auto flex min-h-svh w-full max-w-2xl flex-col justify-center px-4 py-8 sm:px-6 lg:px-8">
        <section className="flex flex-col gap-8">
          <div className="flex flex-col gap-3">
            <p className="text-[0.72rem] font-medium tracking-[0.24em] text-muted-foreground uppercase">
              {m.landing_eyebrow()}
            </p>
            <h1 className="text-4xl font-semibold tracking-tight text-balance text-foreground sm:text-5xl">
              {m.landing_title()}
            </h1>
            <p className="max-w-xl text-sm leading-6 text-muted-foreground sm:text-base">
              {m.landing_description()}
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Link
              to="/sign-in"
              search={{ redirect: undefined }}
              className={cn(buttonVariants({ variant: "default", size: "lg" }))}
            >
              {m.landing_enter_app()}
            </Link>
            <Link
              to="/sign-up"
              search={{ redirect: undefined }}
              className={cn(buttonVariants({ variant: "ghost", size: "lg" }))}
            >
              {m.landing_view_settings()}
            </Link>
            <Link
              to="/app"
              className={cn(buttonVariants({ variant: "ghost", size: "lg" }))}
            >
              {m.landing_open_app()}
              <HugeiconsIcon
                icon={ArrowRight01Icon}
                strokeWidth={2}
                className="size-4"
              />
            </Link>
          </div>
        </section>

        <p className="pt-10 text-xs leading-5 text-muted-foreground">
          {m.landing_surface()}
        </p>
      </div>
    </main>
  )
}
