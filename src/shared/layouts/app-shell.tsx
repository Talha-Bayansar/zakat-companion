import { Link, useLocation } from "@tanstack/react-router"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  AccountSetting01Icon,
  Home01Icon,
  TransactionHistoryIcon,
} from "@hugeicons/core-free-icons"
import type { ReactNode } from "react"

import { m } from "@/paraglide/messages"

import { cn } from "@/shared/lib/cn"
import { buttonVariants } from "@/shared/ui/button"
import { Separator } from "@/shared/ui/separator"

export function AppShell({ children }: { children: ReactNode }) {
  const location = useLocation()
  const navigationItems = [
    {
      label: m.nav_home_label(),
      description: m.nav_home_description(),
      to: "/app" as const,
      icon: Home01Icon,
    },
    {
      label: m.nav_history_label(),
      description: m.nav_history_description(),
      to: "/app/history" as const,
      icon: TransactionHistoryIcon,
    },
    {
      label: m.nav_settings_label(),
      description: m.nav_settings_description(),
      to: "/app/settings" as const,
      icon: AccountSetting01Icon,
    },
  ]

  return (
    <div className="relative min-h-svh overflow-hidden bg-[radial-gradient(circle_at_top,rgba(16,185,129,0.12),transparent_40%),linear-gradient(180deg,rgba(248,250,252,1),rgba(255,255,255,1))] text-foreground">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-64 bg-[linear-gradient(135deg,rgba(16,185,129,0.1),transparent_50%)]" />

      <div className="relative mx-auto flex min-h-svh max-w-7xl">
        <aside className="hidden w-72 shrink-0 border-r border-border/70 bg-background/80 px-6 py-8 backdrop-blur lg:flex lg:flex-col">
          <div className="flex flex-col gap-4">
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.24em] text-muted-foreground">
                {m.app_name()}
              </p>
              <h1 className="mt-2 text-2xl font-semibold tracking-tight">
                {m.shell_title()}
              </h1>
            </div>

            <p className="text-sm leading-6 text-muted-foreground">
              {m.shell_description()}
            </p>
          </div>

          <Separator className="my-6 bg-border/70" />

          <nav className="flex flex-col gap-2">
            {navigationItems.map((item) => {
              const active = isActive(location.pathname, item.to)

              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={cn(
                    buttonVariants({
                      variant: active ? "default" : "ghost",
                      size: "lg",
                    }),
                    "h-auto w-full justify-start rounded-3xl px-4 py-3",
                  )}
                >
                  <span className="flex min-w-0 flex-1 items-center gap-3 text-left">
                    <span
                      className={cn(
                        "inline-flex size-10 items-center justify-center rounded-full border border-border/70 transition-colors",
                        active
                          ? "border-primary/30 bg-primary/10 text-primary"
                          : "bg-background/70 text-muted-foreground",
                      )}
                    >
                      <HugeiconsIcon icon={item.icon} size={20} strokeWidth={1.8} />
                    </span>

                    <span className="flex min-w-0 flex-1 flex-col">
                      <span className="text-sm font-medium">{item.label}</span>
                      <span className="text-xs text-current/70">
                        {item.description}
                      </span>
                    </span>
                  </span>
                </Link>
              )
            })}
          </nav>

          <div className="mt-auto pt-8">
            <Separator className="mb-4 bg-border/70" />
            <p className="text-xs leading-5 text-muted-foreground">
              {m.shell_footer_note()}
            </p>
          </div>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <main className="flex-1 px-4 pb-20 pt-5 sm:px-6 lg:px-8 lg:pb-10 lg:pt-8">
            <div className="mx-auto w-full max-w-5xl">{children}</div>
          </main>
        </div>
      </div>

      <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-border/70 bg-background/95 px-3 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-2 backdrop-blur lg:hidden">
        <div className="mx-auto grid max-w-sm grid-cols-3 gap-1.5">
          {navigationItems.map((item) => {
            const active = isActive(location.pathname, item.to)

            return (
              <Link
                key={item.to}
                to={item.to}
                className={cn(
                  buttonVariants({
                    variant: active ? "default" : "ghost",
                    size: "xs",
                  }),
                  "h-11 w-full rounded-2xl px-2.5 py-2 text-[0.72rem] font-medium",
                )}
              >
                <span className="flex min-w-0 items-center gap-2 leading-none">
                  <span
                    className={cn(
                      "inline-flex shrink-0 items-center justify-center transition-colors",
                      active ? "text-primary-foreground" : "text-current/70",
                    )}
                  >
                    <HugeiconsIcon icon={item.icon} size={18} strokeWidth={2} />
                  </span>

                  <span className="truncate">{item.label}</span>
                </span>
              </Link>
            )
          })}
        </div>
      </nav>
    </div>
  )
}

function isActive(pathname: string, target: string) {
  return normalizePath(pathname) === normalizePath(target)
}

function normalizePath(pathname: string) {
  if (pathname === "/") {
    return pathname
  }

  return pathname.endsWith("/") ? pathname.slice(0, -1) : pathname
}
