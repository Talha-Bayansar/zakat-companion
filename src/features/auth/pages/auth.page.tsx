import { m } from "@/paraglide/messages"

import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyTitle,
} from "@/shared/ui/empty"
import { PageSection } from "@/shared/ui/page"

export function AuthPage() {
  return (
    <main className="flex min-h-svh items-center justify-center p-6">
      <PageSection className="w-full max-w-md">
        <Empty>
          <EmptyContent>
            <EmptyTitle>{m.auth_sign_in_title()}</EmptyTitle>
            <EmptyDescription>{m.auth_surface()}</EmptyDescription>
          </EmptyContent>
        </Empty>
      </PageSection>
    </main>
  )
}
