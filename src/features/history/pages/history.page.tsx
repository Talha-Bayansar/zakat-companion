import { PageHeader, PageSection } from "@/shared/ui/page"
import { Surface } from "@/shared/ui/surface"

export function HistoryPage() {
  return (
    <PageSection>
      <PageHeader
        eyebrow="History"
        title="Review prior cycles later"
        description="This tab will eventually show previous calculations, payment state, and reminder attempts for each profile."
      />

      <Surface variant="subtle">
        <p className="text-sm leading-6 text-muted-foreground">
          Historical entries will follow the same spacing and surface rules as
          the rest of the app.
        </p>
      </Surface>
    </PageSection>
  )
}
