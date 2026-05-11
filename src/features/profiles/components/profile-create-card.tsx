import { useState } from "react"

import { m } from "@/paraglide/messages"

import { useCreateProfileMutation } from "@/features/profiles"
import { Surface } from "@/shared/ui/surface"

import { ProfileNameForm } from "./profile-name-form"

type ProfileCreateCardProps = {
  onCreated?: (profileId: string) => void
}

export function ProfileCreateCard({ onCreated }: ProfileCreateCardProps) {
  const createProfileMutation = useCreateProfileMutation()
  const [formKey, setFormKey] = useState(0)

  return (
    <Surface rounded="xl" padding="lg" className="space-y-4">
      <div className="flex flex-col gap-1">
        <p className="text-sm font-medium text-foreground">
          {m.settings_profile_create_title()}
        </p>
        <p className="text-sm leading-6 text-muted-foreground">
          {m.settings_profile_create_description()}
        </p>
      </div>

      <ProfileNameForm
        key={formKey}
        initialName=""
        submitLabel={m.settings_profile_create_cta()}
        pendingLabel={m.settings_profile_creating()}
        errorLabel={m.settings_profile_create_error()}
        onSubmit={async (name) => {
          const profile = await createProfileMutation.mutateAsync({ name })
          onCreated?.(profile.id)
        }}
        onSuccess={() => {
          setFormKey((value) => value + 1)
        }}
      />
    </Surface>
  )
}
