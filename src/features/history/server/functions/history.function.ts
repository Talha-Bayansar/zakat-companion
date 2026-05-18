import { createServerFn } from "@tanstack/react-start"
import { getRequest } from "@tanstack/react-start/server"

import { m } from "@/paraglide/messages"

import {
  historyMarkCyclePaidInputSchema,
  listHistoryCyclesInputSchema,
} from "../schemas/history.schema"

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

export const listHistoryCyclesFn = createServerFn({ method: "GET" })
  .inputValidator(listHistoryCyclesInputSchema)
  .handler(async ({ data }) => {
    const actor = await requireActor()
    const { listHistoryCycles } = await import("../services/history.service")

    return listHistoryCycles(actor, data)
  })

export const markCyclePaidFn = createServerFn({ method: "POST" })
  .inputValidator(historyMarkCyclePaidInputSchema)
  .handler(async ({ data }) => {
    const actor = await requireActor()
    const { markCyclePaid } = await import("../services/history.service")

    return markCyclePaid(actor, data)
  })
