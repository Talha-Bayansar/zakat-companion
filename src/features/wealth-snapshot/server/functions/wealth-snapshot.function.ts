import { createServerFn } from "@tanstack/react-start"
import { getRequest } from "@tanstack/react-start/server"
import { env } from "cloudflare:workers"

import { m } from "@/paraglide/messages"
import {
  listWealthSnapshotHistoryInputSchema,
  replaceWealthSnapshotInputSchema,
} from "../schemas/wealth-snapshot.schema"

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

const saveWealthSnapshotInputSchema = replaceWealthSnapshotInputSchema.omit({
  profileId: true,
})

export const getCurrentWealthSnapshotFn = createServerFn({ method: "GET" }).handler(
  async () => {
    const actor = await requireActor()
    const { getCurrentWealthSnapshot } = await import(
      "../services/wealth-snapshot.service"
    )

    return getCurrentWealthSnapshot(actor)
  },
)

export const listWealthSnapshotHistoryFn = createServerFn({ method: "GET" })
  .inputValidator(listWealthSnapshotHistoryInputSchema)
  .handler(async ({ data }) => {
    const actor = await requireActor()
    const { listWealthSnapshotHistory } = await import(
      "../services/wealth-snapshot.service"
    )

    return listWealthSnapshotHistory(actor, data)
  })

export const replaceWealthSnapshotFn = createServerFn({ method: "POST" })
  .inputValidator(saveWealthSnapshotInputSchema)
  .handler(async ({ data }) => {
    const actor = await requireActor()
    const { replaceWealthSnapshot } = await import(
      "../services/wealth-snapshot.service"
    )

    return replaceWealthSnapshot(actor, data, {
      benchmarkPricingApiKey: env.METALS_DEV_API_KEY,
    })
  })

export const refreshWealthSnapshotFn = createServerFn({ method: "POST" })
  .inputValidator(saveWealthSnapshotInputSchema)
  .handler(async ({ data }) => {
    const actor = await requireActor()
    const { refreshWealthSnapshot } = await import(
      "../services/wealth-snapshot.service"
    )

    return refreshWealthSnapshot(actor, data, {
      benchmarkPricingApiKey: env.METALS_DEV_API_KEY,
    })
  })
