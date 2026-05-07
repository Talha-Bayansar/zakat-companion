import { PageHeader, PageSection } from "@/shared/ui/page"
import { Surface } from "@/shared/ui/surface"

export function HomePage() {
  return (
    <PageSection>
      <PageHeader
        eyebrow="Home"
        title="Start with the latest wealth snapshot"
        description="This first shell slice gives the app a stable place to land before auth and data flows are connected."
      />

      <Surface>
        <p className="text-sm font-medium">Next up</p>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          We will wire the sign-in flow and keep these primary tabs protected
          for authenticated users.
        </p>
      </Surface>
    </PageSection>
  )
}
