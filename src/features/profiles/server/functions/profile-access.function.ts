import { createServerFn } from "@tanstack/react-start"
import { getRequest } from "@tanstack/react-start/server"

import { m } from "@/paraglide/messages"

import {
  createProfileInputSchema,
  deleteProfileInputSchema,
  listProfileAccessInputSchema,
  manageProfileAccessInputSchema,
  switchActiveProfileInputSchema,
  type CreateProfileInput,
  type DeleteProfileInput,
  type ListProfileAccessInput,
  type ManageProfileAccessInput,
  type SwitchActiveProfileInput,
  type UpdateProfileInput,
  updateProfileInputSchema,
} from "../schemas/profile-access.schema"
import type {
  AccessibleProfile,
  ManagedProfileAccess,
} from "../services/profile-access.service"

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

  return { userId }
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

const createProfileFnInternal = createServerFn({ method: "POST" }).handler(
  async ({ data }: { data: unknown }) => {
    const actor = await requireActor()
    const values = createProfileInputSchema.parse(data)
    const { createProfile } = await import("../services/profile-access.service")

    return createProfile(actor, values)
  },
)
export const createProfileFn = createProfileFnInternal as unknown as (
  options: { data: CreateProfileInput },
) => Promise<AccessibleProfile>

const updateProfileFnInternal = createServerFn({ method: "POST" }).handler(
  async ({ data }: { data: unknown }) => {
    const actor = await requireActor()
    const values = updateProfileInputSchema.parse(data)
    const { updateProfile } = await import("../services/profile-access.service")

    return updateProfile(actor, values)
  },
)
export const updateProfileFn = updateProfileFnInternal as unknown as (
  options: { data: UpdateProfileInput },
) => Promise<AccessibleProfile>

const switchActiveProfileFnInternal = createServerFn({ method: "POST" }).handler(
  async ({ data }: { data: unknown }) => {
    const actor = await requireActor()
    const values = switchActiveProfileInputSchema.parse(data)
    const { switchActiveProfile } = await import(
      "../services/profile-access.service"
    )

    return switchActiveProfile(actor, values)
  },
)
export const switchActiveProfileFn = switchActiveProfileFnInternal as unknown as (
  options: { data: SwitchActiveProfileInput },
) => Promise<AccessibleProfile>

const listManagedProfileAccessFnInternal = createServerFn({ method: "GET" }).handler(
  async ({ data }: { data: unknown }) => {
    const actor = await requireActor()
    const values = listProfileAccessInputSchema.parse(data)
    const { listManagedProfileAccess } = await import(
      "../services/profile-access.service"
    )

    return listManagedProfileAccess(actor, values)
  },
)
export const listManagedProfileAccessFn = listManagedProfileAccessFnInternal as unknown as (
  options: { data: ListProfileAccessInput },
) => Promise<ManagedProfileAccess[]>

const grantProfileAccessFnInternal = createServerFn({ method: "POST" }).handler(
  async ({ data }: { data: unknown }) => {
    const actor = await requireActor()
    const values = manageProfileAccessInputSchema.parse(data)
    const { grantProfileAccess } = await import(
      "../services/profile-access.service"
    )

    return grantProfileAccess(actor, values)
  },
)
export const grantProfileAccessFn = grantProfileAccessFnInternal as unknown as (
  options: { data: ManageProfileAccessInput },
) => Promise<unknown>

const revokeProfileAccessFnInternal = createServerFn({ method: "POST" }).handler(
  async ({ data }: { data: unknown }) => {
    const actor = await requireActor()
    const values = manageProfileAccessInputSchema.parse(data)
    const { revokeProfileAccess } = await import(
      "../services/profile-access.service"
    )

    return revokeProfileAccess(actor, values)
  },
)
export const revokeProfileAccessFn = revokeProfileAccessFnInternal as unknown as (
  options: { data: ManageProfileAccessInput },
) => Promise<{ revoked: boolean }>

const deleteProfileFnInternal = createServerFn({ method: "POST" }).handler(
  async ({ data }: { data: unknown }) => {
    const actor = await requireActor()
    const values = deleteProfileInputSchema.parse(data)
    const { deleteProfile } = await import("../services/profile-access.service")

    return deleteProfile(actor, values)
  },
)
export const deleteProfileFn = deleteProfileFnInternal as unknown as (
  options: { data: DeleteProfileInput },
) => Promise<{ deleted: boolean }>
