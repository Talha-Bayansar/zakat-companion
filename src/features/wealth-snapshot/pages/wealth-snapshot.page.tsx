import { PageHeader, PageSection } from "@/shared/ui/page"
import { Surface } from "@/shared/ui/surface"

export function WealthSnapshotPage() {
  return (
    <main className="flex min-h-svh items-center justify-center p-6">
      <PageSection className="w-full max-w-md">
        <PageHeader
          eyebrow="Wealth Snapshot"
          title="Feature scaffold for zakatable assets and liabilities"
          description="The wealth snapshot flow will inherit the shared app surfaces and text treatment."
        />

        <Surface variant="interactive" padding="lg">
          <p className="text-sm leading-6 text-muted-foreground">
            Snapshot entry and review will live here.
          </p>
        </Surface>
      </PageSection>
    </main>
  )
}
