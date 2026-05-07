import { m } from "@/paraglide/messages"

import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyTitle,
} from "@/shared/ui/empty"
import { PageSection } from "@/shared/ui/page"

export function HistoryPage() {
  return (
    <PageSection className="min-h-[60vh]">
      <Empty className="border-border/70 bg-background/80">
        <EmptyContent>
          <EmptyTitle>{m.history_empty_title()}</EmptyTitle>
          <EmptyDescription>{m.history_empty_description()}</EmptyDescription>
        </EmptyContent>
      </Empty>
    </PageSection>
  )
}
