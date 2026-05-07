import { PageHeader, PageSection } from "@/shared/ui/page"
import { Surface } from "@/shared/ui/surface"

export function ProfilesPage() {
  return (
    <main className="flex min-h-svh items-center justify-center p-6">
      <PageSection className="w-full max-w-md">
        <PageHeader
          eyebrow="Profiles"
          title="Feature scaffold for profile management"
          description="Profile management will inherit the shared iOS-style surfaces and spacing rules."
        />

        <Surface variant="interactive" padding="lg">
          <p className="text-sm leading-6 text-muted-foreground">
            Profile creation and switching will live here.
          </p>
        </Surface>
      </PageSection>
    </main>
  )
}
