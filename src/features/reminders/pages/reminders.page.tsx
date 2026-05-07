import { m } from "@/paraglide/messages"

import { PageHeader, PageSection } from "@/shared/ui/page"
import { Surface } from "@/shared/ui/surface"

export function RemindersPage() {
  return (
    <main className="flex min-h-svh items-center justify-center p-6">
      <PageSection className="w-full max-w-md">
        <PageHeader
          eyebrow={m.reminders_eyebrow()}
          title={m.reminders_title()}
          description={m.reminders_description()}
        />

        <Surface variant="interactive" padding="lg">
          <p className="text-sm leading-6 text-muted-foreground">
            {m.reminders_surface()}
          </p>
        </Surface>
      </PageSection>
    </main>
  )
}
