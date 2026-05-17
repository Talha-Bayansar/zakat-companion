import { createServerFn } from "@tanstack/react-start"
import { getRequest } from "@tanstack/react-start/server"

import { m } from "@/paraglide/messages"
import { reminderPreferenceUpdateInputSchema } from "../schemas/reminders.schema"

async function requireActor() {
  const { auth } = await import("@/server/auth")
  const session = await auth.api.getSession({
    headers: getRequest().headers,
  })

  const userId = session?.user?.id

  if (!userId) {
    const { ProfileAccessError } = await import(
      "@/features/profiles/server/services/profile-access.service"
    )

    throw new ProfileAccessError(
      "UNAUTHENTICATED",
      m.profile_access_sign_in_required(),
    )
  }

  const { getUserRecordById } = await import(
    "@/features/profiles/server/repositories/profile-access.repository"
  )

  const userRecord = await getUserRecordById(userId)

  return {
    userId,
    activeProfileId: userRecord?.activeProfileId ?? null,
  }
}

export const getReminderPreferenceFn = createServerFn({ method: "GET" }).handler(
  async () => {
    const actor = await requireActor()
    const { getReminderPreference } = await import(
      "../services/reminders.service"
    )

    return getReminderPreference(actor)
  },
)

export const updateReminderPreferenceFn = createServerFn({ method: "POST" })
  .inputValidator(reminderPreferenceUpdateInputSchema)
  .handler(async ({ data }) => {
    const actor = await requireActor()
    const { updateReminderPreference } = await import(
      "../services/reminders.service"
    )

    return updateReminderPreference(actor, data)
  })
