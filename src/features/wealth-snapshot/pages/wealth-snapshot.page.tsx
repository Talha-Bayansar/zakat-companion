import { m } from "@/paraglide/messages"

import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyTitle,
} from "@/shared/ui/empty"
import { PageSection } from "@/shared/ui/page"

export function WealthSnapshotPage() {
  return (
    <main className="flex min-h-svh items-center justify-center p-6">
      <PageSection className="w-full max-w-md">
        <Empty className="border-border/70 bg-background/80">
          <EmptyContent>
            <EmptyTitle>{m.wealth_empty_title()}</EmptyTitle>
            <EmptyDescription>{m.wealth_empty_description()}</EmptyDescription>
          </EmptyContent>
        </Empty>
      </PageSection>
    </main>
  )
}
