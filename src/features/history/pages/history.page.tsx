import { m } from "@/paraglide/messages"

import { PageHeader, PageSection } from "@/shared/ui/page"
import { Surface } from "@/shared/ui/surface"

export function HistoryPage() {
  return (
    <PageSection>
      <PageHeader
        eyebrow={m.history_eyebrow()}
        title={m.history_title()}
        description={m.history_description()}
      />

      <Surface variant="subtle">
        <p className="text-sm leading-6 text-muted-foreground">
          {m.history_surface()}
        </p>
      </Surface>
    </PageSection>
  )
}
