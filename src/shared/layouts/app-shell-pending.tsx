import { m } from "@/paraglide/messages"
import { Skeleton } from "@/shared/ui/skeleton"

export function AppShellPending() {
  return (
    <div className="relative min-h-svh overflow-hidden bg-background text-foreground">
      <div className="relative mx-auto flex min-h-svh max-w-7xl">
        <aside className="hidden w-72 shrink-0 border-r border-border/70 bg-background/80 px-6 py-8 backdrop-blur lg:flex lg:flex-col">
          <div className="flex flex-col gap-4">
            <Skeleton className="h-3 w-28" />
            <Skeleton className="h-8 w-44" />
            <Skeleton className="h-12 w-full" />
          </div>

          <div className="mt-6 flex flex-col gap-3">
            <Skeleton className="h-12 w-full rounded-3xl" />
            <Skeleton className="h-12 w-full rounded-3xl" />
            <Skeleton className="h-12 w-full rounded-3xl" />
          </div>

          <div className="mt-auto pt-8">
            <Skeleton className="h-px w-full" />
            <Skeleton className="mt-4 h-10 w-full" />
          </div>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <main className="flex-1 px-4 pt-5 pb-[calc(5rem+env(safe-area-inset-bottom))] sm:px-6 lg:px-8 lg:pt-8 lg:pb-10">
            <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
              <Skeleton className="h-10 w-40" />
              <Skeleton className="h-6 w-3/4 max-w-2xl" />
              <div className="grid gap-4 sm:grid-cols-2">
                <Skeleton className="h-40 rounded-3xl" />
                <Skeleton className="h-40 rounded-3xl" />
              </div>
            </div>
          </main>
        </div>
      </div>

      <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-border/70 bg-background/95 px-3 pt-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] backdrop-blur lg:hidden">
        <div className="mx-auto grid max-w-sm grid-cols-3 gap-1.5">
          <Skeleton className="h-11 rounded-2xl" />
          <Skeleton className="h-11 rounded-2xl" />
          <Skeleton className="h-11 rounded-2xl" />
        </div>
      </nav>

      <span className="sr-only">{m.app_name()}</span>
    </div>
  )
}
