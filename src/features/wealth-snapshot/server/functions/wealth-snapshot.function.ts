import { createServerFn } from "@tanstack/react-start"
import { getRequest } from "@tanstack/react-start/server"

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

async function requireActiveProfileId() {
  const actor = await requireActor()
  const { resolveCurrentActiveProfile } = await import(
    "@/features/profiles/server/services/profile-access.service"
  )

  const activeProfile = await resolveCurrentActiveProfile(actor)

  return activeProfile?.id ?? null
}

const saveWealthSnapshotInputSchema = replaceWealthSnapshotInputSchema.omit({
  profileId: true,
})

export const getCurrentWealthSnapshotFn = createServerFn({ method: "GET" }).handler(
  async () => {
    const profileId = await requireActiveProfileId()

    if (!profileId) {
      return null
    }

    const { getWealthSnapshotWithEntriesRecordByProfileId } = await import(
      "../repositories/wealth-snapshot.repository"
    )

    return getWealthSnapshotWithEntriesRecordByProfileId(profileId)
  },
)

export const listWealthSnapshotHistoryFn = createServerFn({ method: "GET" })
  .inputValidator(listWealthSnapshotHistoryInputSchema)
  .handler(async ({ data }) => {
    const profileId = await requireActiveProfileId()

    if (!profileId) {
      return {
        items: [],
        page: data.page,
        pageSize: data.pageSize,
        hasMore: false,
      }
    }

    const { listWealthSnapshotHistoryRecordsByProfileId } = await import(
      "../repositories/wealth-snapshot.repository"
    )

    return listWealthSnapshotHistoryRecordsByProfileId(profileId, data)
  })

export const replaceWealthSnapshotFn = createServerFn({ method: "POST" })
  .inputValidator(saveWealthSnapshotInputSchema)
  .handler(async ({ data }) => {
    const profileId = await requireActiveProfileId()

    if (!profileId) {
      throw new Error(m.wealth_snapshot_no_active_profile())
    }

    const { replaceWealthSnapshotRecord } = await import(
      "../repositories/wealth-snapshot.repository"
    )

    return replaceWealthSnapshotRecord({
      profileId,
      entries: data.entries,
    })
  })
