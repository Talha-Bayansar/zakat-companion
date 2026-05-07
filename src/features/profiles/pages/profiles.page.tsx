import { m } from "@/paraglide/messages"

import { PageHeader, PageSection } from "@/shared/ui/page"
import { Surface } from "@/shared/ui/surface"

export function ProfilesPage() {
  return (
    <main className="flex min-h-svh items-center justify-center p-6">
      <PageSection className="w-full max-w-md">
        <PageHeader
          eyebrow={m.profiles_eyebrow()}
          title={m.profiles_title()}
          description={m.profiles_description()}
        />

        <Surface variant="interactive" padding="lg">
          <p className="text-sm leading-6 text-muted-foreground">
            {m.profiles_surface()}
          </p>
        </Surface>
      </PageSection>
    </main>
  )
}
