import { m } from "@/paraglide/messages"

import {
  useAccessibleProfileQuery,
  useUpdateProfileMutation,
} from "@/features/profiles"
import { Empty, EmptyContent, EmptyDescription, EmptyTitle } from "@/shared/ui/empty"
import { PageHeaderWithBack, PageSection } from "@/shared/ui/page"
import { Spinner } from "@/shared/ui/spinner"
import { Surface } from "@/shared/ui/surface"

import { ProfileAccessCard } from "../components/profile-access-card"
import { ProfileDetailsForm } from "../components/profile-details-form"

function formatDateInputValue(value: Date | null) {
  return value ? value.toISOString().slice(0, 10) : ""
}

type ProfileEditPageProps = {
  profileId: string
}

export function ProfileEditPage({ profileId }: ProfileEditPageProps) {
  const profileQuery = useAccessibleProfileQuery(profileId)
  const updateProfileMutation = useUpdateProfileMutation()

  if (profileQuery.isLoading) {
    return (
      <PageSection className="gap-6">
        <PageHeaderWithBack
          backTo="/app/settings/profiles"
          backLabel={m.profiles_edit_back()}
          eyebrow={m.profiles_eyebrow()}
          title={m.profiles_edit_title()}
          description={m.profiles_edit_description()}
        />

        <Surface rounded="xl" padding="lg">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Spinner label={m.profiles_edit_loading()} className="size-4" />
            <span>{m.profiles_edit_loading()}</span>
          </div>
        </Surface>
      </PageSection>
    )
  }

  if (profileQuery.isError) {
    return (
      <PageSection className="gap-6">
        <PageHeaderWithBack
          backTo="/app/settings/profiles"
          backLabel={m.profiles_edit_back()}
          eyebrow={m.profiles_eyebrow()}
          title={m.profiles_edit_title()}
          description={m.profiles_edit_description()}
        />

        <p className="rounded-2xl border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm leading-6 text-destructive">
          {profileQuery.error instanceof Error && profileQuery.error.message
            ? profileQuery.error.message
            : m.profiles_edit_load_error()}
        </p>
      </PageSection>
    )
  }

  return (
    <PageSection className="gap-6">
      <PageHeaderWithBack
        backTo="/app/settings/profiles"
        backLabel={m.profiles_edit_back()}
        eyebrow={m.profiles_eyebrow()}
        title={m.profiles_edit_title()}
        description={m.profiles_edit_description()}
      />

      {!profileQuery.data ? (
        <Empty className="border-border/70 bg-background/80">
          <EmptyContent>
            <EmptyTitle>{m.profiles_edit_not_found_title()}</EmptyTitle>
            <EmptyDescription>{m.profiles_edit_not_found_description()}</EmptyDescription>
          </EmptyContent>
        </Empty>
      ) : (
        <>
          <Surface rounded="xl" padding="lg">
            <ProfileDetailsForm
              initialValues={{
                name: profileQuery.data.name,
                hawlStartedAt: formatDateInputValue(profileQuery.data.hawlStartedAt),
                madhab: profileQuery.data.madhab,
                nisabBenchmark: profileQuery.data.nisabBenchmark,
              }}
              submitLabel={m.profiles_edit_submit_cta()}
              pendingLabel={m.profiles_edit_updating()}
              errorLabel={m.profiles_edit_error()}
              onSubmit={async (values) => {
                await updateProfileMutation.mutateAsync({
                  profileId: profileQuery.data.id,
                  ...values,
                })
              }}
            />
          </Surface>

          <ProfileAccessCard profile={profileQuery.data} />
        </>
      )}
    </PageSection>
  )
}
