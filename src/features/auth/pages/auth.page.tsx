import { PageHeader, PageSection } from "@/shared/ui/page"
import { Surface } from "@/shared/ui/surface"

export function AuthPage() {
  return (
    <main className="flex min-h-svh items-center justify-center p-6">
      <PageSection className="w-full max-w-md">
        <PageHeader
          eyebrow="Auth"
          title="Feature scaffold for sign-in and session management"
          description="The auth flow will adopt the same surface, spacing, typography, and interaction rules as the rest of the app."
        />

        <Surface variant="interactive" padding="lg">
          <p className="text-sm leading-6 text-muted-foreground">
            Sign-in controls will be introduced here.
          </p>
        </Surface>
      </PageSection>
    </main>
  )
}
