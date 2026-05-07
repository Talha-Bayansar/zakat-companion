import { m } from "@/paraglide/messages"

import { PageHeader, PageSection } from "@/shared/ui/page"
import { Surface } from "@/shared/ui/surface"

export function AuthPage() {
  return (
    <main className="flex min-h-svh items-center justify-center p-6">
      <PageSection className="w-full max-w-md">
        <PageHeader
          eyebrow={m.auth_eyebrow()}
          title={m.auth_title()}
          description={m.auth_description()}
        />

        <Surface variant="interactive" padding="lg">
          <p className="text-sm leading-6 text-muted-foreground">
            {m.auth_surface()}
          </p>
        </Surface>
      </PageSection>
    </main>
  )
}
