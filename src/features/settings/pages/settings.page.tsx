import { m } from "@/paraglide/messages"

import { PageHeader, PageSection } from "@/shared/ui/page"
import { Separator } from "@/shared/ui/separator"
import { LocaleSwitcher } from "@/shared/ui/locale-switcher"

export function SettingsPage() {
  return (
    <PageSection className="gap-6">
      <PageHeader
        eyebrow={m.settings_eyebrow()}
        title={m.settings_title()}
        description={m.settings_description()}
      />

      <section className="flex flex-col gap-4 rounded-[1.75rem] border border-border/70 bg-background/80 p-5 backdrop-blur-sm">
        <div className="flex flex-col gap-1">
          <p className="text-sm font-medium text-foreground">
            {m.locale_label()}
          </p>
          <p className="text-sm leading-6 text-muted-foreground">
            {m.settings_surface()}
          </p>
        </div>

        <Separator />

        <LocaleSwitcher className="max-w-none" />
      </section>

      <section className="flex flex-col gap-2 px-1">
        <p className="text-sm font-medium text-foreground">App experience</p>
        <p className="text-sm leading-6 text-muted-foreground">
          Language stays here. Navigation stays in the shell. Other preferences
          can join this page later without crowding the main screens.
        </p>
      </section>
    </PageSection>
  )
}
