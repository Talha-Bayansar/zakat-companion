import { m } from "@/paraglide/messages"

import { PageHeader, PageSection } from "@/shared/ui/page"
import { Surface } from "@/shared/ui/surface"

export function HomePage() {
  return (
    <PageSection>
      <PageHeader
        eyebrow={m.home_eyebrow()}
        title={m.home_title()}
        description={m.home_description()}
      />

      <Surface>
        <p className="text-sm font-medium">{m.home_next_up()}</p>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          {m.home_next_up_body()}
        </p>
      </Surface>
    </PageSection>
  )
}
