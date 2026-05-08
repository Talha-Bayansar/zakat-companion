import { createServerFn } from "@tanstack/react-start"
import { getRequest } from "@tanstack/react-start/server"

import { auth } from "@/server/auth"
import { m } from "@/paraglide/messages"

import {
  createProfile,
  grantProfileAccess,
  listAccessibleProfiles,
  revokeProfileAccess,
  switchActiveProfile,
  ProfileAccessError,
} from "../services/profile-access.service"
import {
  createProfileInputSchema,
  manageProfileAccessInputSchema,
  switchActiveProfileInputSchema,
} from "../schemas/profile-access.schema"

async function requireActor() {
  const session = await auth.api.getSession({
    headers: getRequest().headers,
  })

  const userId = session?.user?.id

  if (!userId) {
    throw new ProfileAccessError(
      "UNAUTHENTICATED",
      m.profile_access_sign_in_required(),
    )
  }

  return { userId }
}

export const listAccessibleProfilesFn = createServerFn({ method: "GET" }).handler(
  async () => {
    const actor = await requireActor()
    return listAccessibleProfiles(actor)
  },
)

export const createProfileFn = createServerFn({ method: "POST" }).handler(
  async (input: unknown) => {
    const actor = await requireActor()
    const values = createProfileInputSchema.parse(input)

    return createProfile(actor, values)
  },
)

export const switchActiveProfileFn = createServerFn({ method: "POST" }).handler(
  async (input: unknown) => {
    const actor = await requireActor()
    const values = switchActiveProfileInputSchema.parse(input)

    return switchActiveProfile(actor, values)
  },
)

export const grantProfileAccessFn = createServerFn({ method: "POST" }).handler(
  async (input: unknown) => {
    const actor = await requireActor()
    const values = manageProfileAccessInputSchema.parse(input)

    return grantProfileAccess(actor, values)
  },
)

export const revokeProfileAccessFn = createServerFn({ method: "POST" }).handler(
  async (input: unknown) => {
    const actor = await requireActor()
    const values = manageProfileAccessInputSchema.parse(input)

    return revokeProfileAccess(actor, values)
  },
)
