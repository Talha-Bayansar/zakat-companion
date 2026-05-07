import { PageHeader, PageSection } from "@/shared/ui/page"
import { Surface } from "@/shared/ui/surface"

export function SettingsPage() {
  return (
    <PageSection>
      <PageHeader
        eyebrow="Settings"
        title="Keep account setup in one place"
        description="Profile creation, switching, delegated access, and reminder preferences will live here."
      />

      <Surface>
        <p className="text-sm leading-6 text-muted-foreground">
          Account actions and preferences will use the same reusable patterns
          as other screens.
        </p>
      </Surface>
    </PageSection>
  )
}
