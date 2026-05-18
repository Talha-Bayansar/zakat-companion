import { useNavigate } from "@tanstack/react-router"

import { m } from "@/paraglide/messages"

import { Button } from "@/shared/ui/button"
import { DestructiveConfirmDialog } from "@/shared/ui/destructive-confirm-dialog"
import { PageHeader, PageSection } from "@/shared/ui/page"
import { Separator } from "@/shared/ui/separator"
import { LocaleSwitcher } from "@/shared/ui/locale-switcher"

import { useSignOutMutation } from "@/features/auth/lib/auth.mutations"
import { ActiveProfileSelectorSection } from "../components/active-profile-selector-section"
import { ActiveProfileFiqhSection } from "../components/active-profile-fiqh-section"
import { NotificationPreferencesSection } from "../components/notification-preferences-section"
import { ReminderPreferencesSection } from "../components/reminder-preferences-section"

export function SettingsPage() {
  const navigate = useNavigate()
  const signOutMutation = useSignOutMutation()

  return (
    <PageSection className="gap-6">
      <PageHeader
        eyebrow={m.settings_eyebrow()}
        title={m.settings_title()}
        description={m.settings_description()}
      />

      <ActiveProfileSelectorSection />

      <ActiveProfileFiqhSection />

      <NotificationPreferencesSection />

      <ReminderPreferencesSection />

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
        <p className="text-sm font-medium text-foreground">
          {m.settings_app_experience_title()}
        </p>
        <p className="text-sm leading-6 text-muted-foreground">
          {m.settings_app_experience_description()}
        </p>
      </section>

      <section className="flex flex-col gap-3 rounded-[1.75rem] border border-border/70 bg-background/80 p-5 backdrop-blur-sm">
        <div className="flex flex-col gap-1">
          <p className="text-sm font-medium text-foreground">
            {m.settings_account_title()}
          </p>
          <p className="text-sm leading-6 text-muted-foreground">
            {m.settings_account_description()}
          </p>
        </div>

        <DestructiveConfirmDialog
          title={m.settings_sign_out_confirm_title()}
          description={m.settings_sign_out_confirm_description()}
          confirmLabel={m.settings_sign_out_confirm_confirm()}
          cancelLabel={m.settings_sign_out_confirm_cancel()}
          pendingLabel={m.settings_signing_out()}
          onConfirm={async () => {
            await signOutMutation.mutateAsync()
            await navigate({
              to: "/sign-in",
              search: { redirect: undefined },
            })
          }}
          trigger={
            <Button type="button" variant="secondary" className="w-full rounded-2xl">
              {m.settings_sign_out()}
            </Button>
          }
        />
      </section>
    </PageSection>
  )
}
