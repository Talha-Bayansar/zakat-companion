import { m } from "@/paraglide/messages"
import { parseHawlStartedAtInputValue } from "@/features/profiles/lib/profile-hawl-started-at"
import {
  createProfileRecord,
  deleteProfileRecord,
  deleteProfileAccessGrantRecord,
  findUserRecordByEmail,
  getProfileAccessGrantRecord,
  getProfileRecordById,
  listAccessibleProfilePageRecords,
  listProfileAccessGrantPageRecords,
  listDelegatedProfileRecords,
  listOwnedProfileRecords,
  updateUserActiveProfileRecord,
  type ProfileAccessGrantRecord,
  type ProfileRecord,
  updateProfileRecord,
  upsertProfileAccessGrantRecord,
} from "../repositories/profile-access.repository"
import { createDefaultReminderPreferenceRecord } from "@/features/reminders/server/repositories/reminders.repository"
import type {
  AccessibleProfile,
} from "../../lib/profile-access.types"
import type {
  CreateProfileInput,
  DeleteProfileInput,
  GetAccessibleProfileInput,
  ListAccessibleProfilesPageInput,
  ListProfileAccessInput,
  ManageProfileAccessInput,
  UpdateProfileInput,
  SwitchActiveProfileInput,
} from "../schemas/profile-access.schema"
import type { InfiniteListPage } from "@/shared/lib/infinite-list"

export type AccessibleProfilesPage = InfiniteListPage<AccessibleProfile>

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
  activeProfileId: string | null
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
      hawlStartedAt: record.hawlStartedAt,
      madhab: record.madhab,
      nisabBenchmark: record.nisabBenchmark,
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

export function resolveAccessibleProfileSelection(
  activeProfileId: string | null,
  profiles: AccessibleProfile[],
) {
  if (activeProfileId) {
    const selectedProfile = profiles.find(
      (profile) => profile.id === activeProfileId,
    )

    if (selectedProfile) {
      return selectedProfile
    }
  }

  return profiles[0] ?? null
}

async function persistActiveProfileSelection(
  actor: Actor,
  profileId: string | null,
) {
  await updateUserActiveProfileRecord(actor.userId, profileId)
}

export async function listAccessibleProfiles(actor: Actor) {
  const [ownedProfiles, delegatedProfiles] = await Promise.all([
    listOwnedProfileRecords(actor.userId, {
      page: 1,
      pageSize: 1000,
    }),
    listDelegatedProfileRecords(actor.userId, {
      page: 1,
      pageSize: 1000,
    }),
  ])

  return combineAccessibleProfiles(ownedProfiles, delegatedProfiles)
}

export async function listAccessibleProfilesPage(
  actor: Actor,
  input: ListAccessibleProfilesPageInput,
): Promise<AccessibleProfilesPage> {
  const pageSize = input.pageSize ?? 20
  const rows = await listAccessibleProfilePageRecords(actor.userId, {
    page: input.page,
    pageSize,
    search: input.search,
  })
  const hasMore = rows.length > pageSize
  const items = rows.slice(0, pageSize).map((row) => {
    const { sortRole: _sortRole, ...profileRecord } = row
    return {
      ...profileRecord,
    }
  })

  return {
    items,
    page: input.page,
    pageSize,
    hasMore,
  }
}

export async function getAccessibleProfile(
  actor: Actor,
  input: GetAccessibleProfileInput,
) {
  return requireAccessibleProfileRecord(actor, input.profileId)
}

export async function resolveCurrentActiveProfile(actor: Actor) {
  const profiles = await listAccessibleProfiles(actor)
  const selectedProfile = resolveAccessibleProfileSelection(
    actor.activeProfileId,
    profiles,
  )

  if (!selectedProfile) {
    if (actor.activeProfileId !== null) {
      await persistActiveProfileSelection(actor, null)
    }

    return null
  }

  if (selectedProfile.id !== actor.activeProfileId) {
    await persistActiveProfileSelection(actor, selectedProfile.id)
  }

  return selectedProfile
}

export async function createProfile(actor: Actor, input: CreateProfileInput) {
  const currentActiveProfile = await resolveCurrentActiveProfile(actor)
  const record = await createProfileRecord(
    actor.userId,
    input.name.trim(),
    parseHawlStartedAtInputValue(input.hawlStartedAt),
    input.madhab,
    input.nisabBenchmark,
  )
  await createDefaultReminderPreferenceRecord(record.id)

  if (!currentActiveProfile) {
    await persistActiveProfileSelection(actor, record.id)
  }

  const profile = toOwnerAccessibleProfile(record)

  return {
    profile,
    activeProfile: currentActiveProfile ?? profile,
  }
}

export async function updateProfile(actor: Actor, input: UpdateProfileInput) {
  const record = await requireAccessibleProfileRecord(actor, input.profileId)

  const updated = await updateProfileRecord(
    record.id,
    input.name.trim(),
    parseHawlStartedAtInputValue(input.hawlStartedAt),
    input.madhab,
    input.nisabBenchmark,
  )

  if (!updated) {
    throw new ProfileAccessError(
      "NOT_FOUND",
      m.profile_access_not_found(),
    )
  }

  if (record.role === "owner") {
    return toOwnerAccessibleProfile(updated)
  }

  return toManagerAccessibleProfile(updated, {
    createdAt: record.accessGrantedAt ?? updated.updatedAt,
    grantedByUserId: record.grantedByUserId ?? actor.userId,
  })
}

export async function switchActiveProfile(
  actor: Actor,
  input: SwitchActiveProfileInput,
) {
  const record = await requireAccessibleProfileRecord(actor, input.profileId)

  await persistActiveProfileSelection(actor, record.id)

  return record
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

  return listProfileAccessGrantPageRecords(profileRecord.id, {
    page: 1,
    pageSize: 1000,
  })
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
  const currentActiveProfile = await resolveCurrentActiveProfile(actor)
  const profileRecord = await requireOwnerAccess(actor, input.profileId)
  const deleted = await deleteProfileRecord(profileRecord.id)
  const activeProfile =
    deleted !== null
      ? await resolveCurrentActiveProfile({
          ...actor,
          activeProfileId:
            currentActiveProfile?.id === profileRecord.id
              ? null
              : actor.activeProfileId,
        })
      : currentActiveProfile

  return {
    deleted: deleted !== null,
    activeProfile,
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
