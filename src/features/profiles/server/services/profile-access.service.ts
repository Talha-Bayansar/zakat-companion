import {
  m,
} from "@/paraglide/messages"
import {
  createProfileRecord,
  deleteProfileRecord,
  deleteProfileAccessGrantRecord,
  findUserRecordByEmail,
  getProfileAccessGrantRecord,
  getProfileRecordById,
  listProfileAccessGrantRecords,
  listDelegatedProfileRecords,
  listOwnedProfileRecords,
  type ManagedProfileAccessRecord,
  type ProfileAccessGrantRecord,
  type ProfileRecord,
  updateProfileRecord,
  upsertProfileAccessGrantRecord,
} from "../repositories/profile-access.repository"
import type {
  CreateProfileInput,
  DeleteProfileInput,
  ListProfileAccessInput,
  ManageProfileAccessInput,
  UpdateProfileInput,
  SwitchActiveProfileInput,
} from "../schemas/profile-access.schema"

export type ProfileAccessRole = "owner" | "manager"

export type AccessibleProfile = ProfileRecord & {
  role: ProfileAccessRole
  canManageAccess: boolean
  accessGrantedAt: Date | null
  grantedByUserId: string | null
}

export type ManagedProfileAccess = ManagedProfileAccessRecord

export class ProfileAccessError extends Error {
  readonly code:
    | "UNAUTHENTICATED"
    | "NOT_FOUND"
    | "FORBIDDEN"
    | "INVALID_TARGET"

  constructor(
    code: ProfileAccessError["code"],
    message: string,
  ) {
    super(message)
    this.name = "ProfileAccessError"
    this.code = code
  }
}

type Actor = {
  userId: string
}

function toOwnerAccessibleProfile(record: ProfileRecord): AccessibleProfile {
  return {
    ...record,
    role: "owner",
    canManageAccess: true,
    accessGrantedAt: null,
    grantedByUserId: null,
  }
}

function toManagerAccessibleProfile(
  record: ProfileRecord,
  grant: Pick<ProfileAccessGrantRecord, "createdAt" | "grantedByUserId">,
): AccessibleProfile {
  return {
    ...record,
    role: "manager",
    canManageAccess: false,
    accessGrantedAt: grant.createdAt,
    grantedByUserId: grant.grantedByUserId,
  }
}

async function requireProfileRecord(profileId: string) {
  const record = await getProfileRecordById(profileId)

  if (!record) {
    throw new ProfileAccessError(
      "NOT_FOUND",
      m.profile_access_not_found(),
    )
  }

  return record
}

async function requireAccessibleProfileRecord(
  actor: Actor,
  profileId: string,
) {
  const record = await requireProfileRecord(profileId)

  if (record.ownerId === actor.userId) {
    return toOwnerAccessibleProfile(record)
  }

  const grant = await getProfileAccessGrantRecord(profileId, actor.userId)

  if (!grant) {
    throw new ProfileAccessError(
      "FORBIDDEN",
      m.profile_access_forbidden(),
    )
  }

  return toManagerAccessibleProfile(record, grant)
}

async function requireOwnerAccess(actor: Actor, profileId: string) {
  const record = await requireProfileRecord(profileId)

  if (record.ownerId !== actor.userId) {
    throw new ProfileAccessError(
      "FORBIDDEN",
      m.profile_access_owner_only(),
    )
  }

  return record
}

function normalizeEmail(email: string) {
  return email.trim().toLowerCase()
}

function combineAccessibleProfiles(
  ownedProfiles: ProfileRecord[],
  delegatedProfiles: Array<
    ProfileRecord & {
      grantedAt: Date
      grantedByUserId: string
    }
  >,
) {
  const profilesById = new Map<string, AccessibleProfile>()

  for (const record of delegatedProfiles) {
    profilesById.set(record.id, {
      id: record.id,
      name: record.name,
      ownerId: record.ownerId,
      role: "manager",
      canManageAccess: false,
      accessGrantedAt: record.grantedAt,
      grantedByUserId: record.grantedByUserId,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    })
  }

  for (const record of ownedProfiles) {
    profilesById.set(record.id, toOwnerAccessibleProfile(record))
  }

  return [...profilesById.values()].sort((left, right) => {
    if (left.role !== right.role) {
      return left.role === "owner" ? -1 : 1
    }

    return left.name.localeCompare(right.name)
  })
}

export async function listAccessibleProfiles(actor: Actor) {
  const [ownedProfiles, delegatedProfiles] = await Promise.all([
    listOwnedProfileRecords(actor.userId),
    listDelegatedProfileRecords(actor.userId),
  ])

  return combineAccessibleProfiles(ownedProfiles, delegatedProfiles)
}

export async function createProfile(actor: Actor, input: CreateProfileInput) {
  const record = await createProfileRecord(actor.userId, input.name.trim())

  return toOwnerAccessibleProfile(record)
}

export async function updateProfile(actor: Actor, input: UpdateProfileInput) {
  const record = await requireAccessibleProfileRecord(actor, input.profileId)

  const updated = await updateProfileRecord(record.id, input.name.trim())

  if (!updated) {
    throw new ProfileAccessError(
      "NOT_FOUND",
      m.profile_access_not_found(),
    )
  }

  return {
    id: updated.id,
    name: updated.name,
    ownerId: updated.ownerId,
    role: record.role,
    canManageAccess: record.canManageAccess,
    accessGrantedAt: record.accessGrantedAt,
    grantedByUserId: record.grantedByUserId,
    createdAt: updated.createdAt,
    updatedAt: updated.updatedAt,
  }
}

export async function switchActiveProfile(
  actor: Actor,
  input: SwitchActiveProfileInput,
) {
  return requireAccessibleProfileRecord(actor, input.profileId)
}

export async function grantProfileAccess(
  actor: Actor,
  input: ManageProfileAccessInput,
) {
  const profileRecord = await requireOwnerAccess(actor, input.profileId)
  const targetUser = await findUserRecordByEmail(normalizeEmail(input.email))

  if (!targetUser) {
    throw new ProfileAccessError(
      "NOT_FOUND",
      m.profile_access_user_not_found(),
    )
  }

  if (targetUser.id === profileRecord.ownerId) {
    throw new ProfileAccessError(
      "INVALID_TARGET",
      m.profile_access_owner_already_has_access(),
    )
  }

  const grant = await upsertProfileAccessGrantRecord(
    profileRecord.id,
    targetUser.id,
    actor.userId,
  )

  return grant
}

export async function listManagedProfileAccess(
  actor: Actor,
  input: ListProfileAccessInput,
) {
  const profileRecord = await requireOwnerAccess(actor, input.profileId)

  return listProfileAccessGrantRecords(profileRecord.id)
}

export async function revokeProfileAccess(
  actor: Actor,
  input: ManageProfileAccessInput,
) {
  const profileRecord = await requireOwnerAccess(actor, input.profileId)
  const targetUser = await findUserRecordByEmail(normalizeEmail(input.email))

  if (!targetUser) {
    throw new ProfileAccessError(
      "NOT_FOUND",
      m.profile_access_user_not_found(),
    )
  }

  const deleted = await deleteProfileAccessGrantRecord(
    profileRecord.id,
    targetUser.id,
  )

  return {
    revoked: deleted.length > 0,
  }
}

export async function deleteProfile(actor: Actor, input: DeleteProfileInput) {
  const profileRecord = await requireOwnerAccess(actor, input.profileId)
  const deleted = await deleteProfileRecord(profileRecord.id)

  return {
    deleted: deleted !== null,
  }
}

export async function hasProfileEditAccess(actor: Actor, profileId: string) {
  try {
    await requireAccessibleProfileRecord(actor, profileId)
    return true
  } catch (error) {
    if (error instanceof ProfileAccessError && error.code === "FORBIDDEN") {
      return false
    }

    throw error
  }
}
