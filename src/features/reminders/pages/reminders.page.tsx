import { PageHeader, PageSection } from "@/shared/ui/page"
import { Surface } from "@/shared/ui/surface"

export function RemindersPage() {
  return (
    <main className="flex min-h-svh items-center justify-center p-6">
      <PageSection className="w-full max-w-md">
        <PageHeader
          eyebrow="Reminders"
          title="Feature scaffold for reminder scheduling and delivery"
          description="Reminder setup will reuse the same shared patterns for cards, spacing, and state feedback."
        />

        <Surface variant="interactive" padding="lg">
          <p className="text-sm leading-6 text-muted-foreground">
            Reminder configuration will land here.
          </p>
        </Surface>
      </PageSection>
    </main>
  )
}
