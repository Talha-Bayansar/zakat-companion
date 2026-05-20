import { useNavigate } from "@tanstack/react-router"

import { m } from "@/paraglide/messages"

import { Surface } from "@/shared/ui/surface"
import { PageHeaderWithBack, PageSection } from "@/shared/ui/page"

import { useCreateProfileMutation } from "@/features/profiles"

import { ProfileDetailsForm } from "../components/profile-details-form"

type ProfileCreatePageProps = {
  redirectTo?: string
}

export function ProfileCreatePage({ redirectTo }: ProfileCreatePageProps) {
  const navigate = useNavigate()
  const createProfileMutation = useCreateProfileMutation()

  return (
    <PageSection className="gap-6">
      <PageHeaderWithBack
        backTo="/app/settings/profiles"
        backLabel={m.profiles_create_back()}
        eyebrow={m.profiles_eyebrow()}
        title={m.profiles_create_title()}
        description={m.profiles_create_description()}
      />

      <Surface rounded="xl" padding="lg">
        <ProfileDetailsForm
          initialValues={{
            name: "",
            hawlStartedAt: "",
            madhab: "",
            nisabBenchmark: "",
          }}
          submitLabel={m.profiles_create_submit_cta()}
          pendingLabel={m.profiles_creating()}
          errorLabel={m.profiles_create_error()}
          onSubmit={async (values) => {
            const result = await createProfileMutation.mutateAsync(values)
            if (redirectTo) {
              await navigate({
                to: redirectTo,
              })
              return
            }

            await navigate({
              to: "/app/settings/profiles/$profileId",
              params: { profileId: result.profile.id },
            })
          }}
        />
      </Surface>
    </PageSection>
  )
}
