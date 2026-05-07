import { createFileRoute } from "@tanstack/react-router"

import { Link } from "@tanstack/react-router"

import { PageHeader, PageSection } from "@/shared/ui/page"
import { Surface } from "@/shared/ui/surface"
import { buttonVariants } from "@/shared/ui/button"
import { cn } from "@/shared/lib/cn"

export const Route = createFileRoute("/")({ component: LandingPage })

function LandingPage() {
  return (
    <main className="flex min-h-svh items-center px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-5xl">
        <PageSection className="max-w-2xl">
          <PageHeader
            eyebrow="Zakat Companion"
            title="Track zakat with a calm, native-feeling app"
            description="The public landing page stays separate from the app. Start inside the app area when you are ready."
          />

          <div className="flex flex-wrap gap-3">
            <Link
              to="/app"
              className={cn(buttonVariants({ variant: "default" }))}
            >
              Enter app
            </Link>
            <Link
              to="/app/settings"
              className={cn(buttonVariants({ variant: "ghost" }))}
            >
              View settings
            </Link>
          </div>

          <Surface variant="elevated" className="mt-2" padding="lg">
            <p className="text-sm leading-6 text-muted-foreground">
              This page is now the public landing page. The app shell and all
              app-specific routes live under <span className="font-medium text-foreground">/app</span>.
            </p>
          </Surface>
        </PageSection>
      </div>
    </main>
  )
}
