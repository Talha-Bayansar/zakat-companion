import { createServerFn } from "@tanstack/react-start"
import { getRequest } from "@tanstack/react-start/server"

import { m } from "@/paraglide/messages"

import {
  createProfileInputSchema,
  deleteProfileInputSchema,
  getAccessibleProfileInputSchema,
  listAccessibleProfilesPageInputSchema,
  listProfileAccessInputSchema,
  manageProfileAccessInputSchema,
  switchActiveProfileInputSchema,
  updateProfileInputSchema,
} from "../schemas/profile-access.schema"
async function requireActor() {
  const { auth } = await import("@/server/auth")
  const session = await auth.api.getSession({
    headers: getRequest().headers,
  })

  const userId = session?.user?.id

  if (!userId) {
    const { ProfileAccessError } = await import("../services/profile-access.service")

    throw new ProfileAccessError(
      "UNAUTHENTICATED",
      m.profile_access_sign_in_required(),
    )
  }

  const { getUserRecordById } = await import(
    "../repositories/profile-access.repository"
  )
  const userRecord = await getUserRecordById(userId)

  return {
    userId,
    activeProfileId: userRecord?.activeProfileId ?? null,
  }
}

export const listAccessibleProfilesFn = createServerFn({ method: "GET" }).handler(
  async () => {
    const actor = await requireActor()
    const { listAccessibleProfiles } = await import(
      "../services/profile-access.service"
    )

    return listAccessibleProfiles(actor)
  },
)

export const getAccessibleProfileFn = createServerFn({ method: "GET" })
  .inputValidator(getAccessibleProfileInputSchema)
  .handler(async ({ data }) => {
    const actor = await requireActor()
    const { getAccessibleProfile } = await import(
      "../services/profile-access.service"
    )

    return getAccessibleProfile(actor, data)
  })

export const getCurrentActiveProfileFn = createServerFn({ method: "GET" }).handler(
  async () => {
    const actor = await requireActor()
    const { resolveCurrentActiveProfile } = await import(
      "../services/profile-access.service"
    )

    return resolveCurrentActiveProfile(actor)
  },
)

export const listAccessibleProfilesPageFn = createServerFn({ method: "GET" })
  .inputValidator(listAccessibleProfilesPageInputSchema)
  .handler(async ({ data }) => {
    const actor = await requireActor()
    const { listAccessibleProfilesPage } = await import(
      "../services/profile-access.service"
    )

    return listAccessibleProfilesPage(actor, data)
  })

export const createProfileFn = createServerFn({ method: "POST" })
  .inputValidator(createProfileInputSchema)
  .handler(async ({ data }) => {
    const actor = await requireActor()
    const { createProfile } = await import("../services/profile-access.service")

    return createProfile(actor, data)
  })

export const updateProfileFn = createServerFn({ method: "POST" })
  .inputValidator(updateProfileInputSchema)
  .handler(async ({ data }) => {
    const actor = await requireActor()
    const { updateProfile } = await import("../services/profile-access.service")

    return updateProfile(actor, data)
  })

export const switchActiveProfileFn = createServerFn({ method: "POST" })
  .inputValidator(switchActiveProfileInputSchema)
  .handler(async ({ data }) => {
    const actor = await requireActor()
    const { switchActiveProfile } = await import(
      "../services/profile-access.service"
    )

    return switchActiveProfile(actor, data)
  })

export const listManagedProfileAccessFn = createServerFn({ method: "GET" })
  .inputValidator(listProfileAccessInputSchema)
  .handler(async ({ data }) => {
    const actor = await requireActor()
    const { listManagedProfileAccess } = await import(
      "../services/profile-access.service"
    )

    return listManagedProfileAccess(actor, data)
  })

export const grantProfileAccessFn = createServerFn({ method: "POST" })
  .inputValidator(manageProfileAccessInputSchema)
  .handler(async ({ data }) => {
    const actor = await requireActor()
    const { grantProfileAccess } = await import(
      "../services/profile-access.service"
    )

    return grantProfileAccess(actor, data)
  })

export const revokeProfileAccessFn = createServerFn({ method: "POST" })
  .inputValidator(manageProfileAccessInputSchema)
  .handler(async ({ data }) => {
    const actor = await requireActor()
    const { revokeProfileAccess } = await import(
      "../services/profile-access.service"
    )

    return revokeProfileAccess(actor, data)
  })

export const deleteProfileFn = createServerFn({ method: "POST" })
  .inputValidator(deleteProfileInputSchema)
  .handler(async ({ data }) => {
    const actor = await requireActor()
    const { deleteProfile } = await import("../services/profile-access.service")

    return deleteProfile(actor, data)
  })
