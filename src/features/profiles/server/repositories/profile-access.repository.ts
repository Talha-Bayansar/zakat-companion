import { and, asc, desc, eq, ilike, sql } from "drizzle-orm"

import { db } from "@/server/db/client"
import {
  profile,
  profilePermission,
  user,
} from "@/server/db/schema"
import {
  type FiqhMadhabCode,
  type FiqhNisabBenchmarkCode,
} from "@/features/fiqh-calculation"

export type ProfileRecord = {
  id: string
  name: string
  ownerId: string
  madhab: FiqhMadhabCode
  nisabBenchmark: FiqhNisabBenchmarkCode
  createdAt: Date
  updatedAt: Date
}

export type ProfileAccessGrantRecord = {
  id: string
  profileId: string
  userId: string
  grantedByUserId: string
  permission: string
  createdAt: Date
}

export type ManagedProfileAccessRecord = ProfileAccessGrantRecord & {
  userEmail: string
}

export type UserRecord = {
  id: string
  email: string
  activeProfileId: string | null
}

export type ProfileAccessRole = "owner" | "manager"

export type AccessibleProfilePageRecord = ProfileRecord & {
  role: ProfileAccessRole
  canManageAccess: boolean
  accessGrantedAt: Date | null
  grantedByUserId: string | null
  sortRole: number
}

export async function listOwnedProfileRecords(
  ownerId: string,
  input: {
    page: number
    pageSize: number
    search?: string
  },
) {
  const conditions = [eq(profile.ownerId, ownerId)]

  if (input.search) {
    conditions.push(ilike(profile.name, `%${input.search}%`))
  }

  return db
    .select({
      id: profile.id,
      name: profile.name,
      ownerId: profile.ownerId,
      madhab: profile.madhab,
      nisabBenchmark: profile.nisabBenchmark,
      createdAt: profile.createdAt,
      updatedAt: profile.updatedAt,
    })
    .from(profile)
    .where(and(...conditions))
    .orderBy(asc(profile.name), asc(profile.id))
    .limit(input.pageSize)
    .offset((input.page - 1) * input.pageSize)
}

export async function listDelegatedProfileRecords(
  userId: string,
  input: {
    page: number
    pageSize: number
    search?: string
  },
) {
  const conditions = [eq(profilePermission.userId, userId)]

  if (input.search) {
    conditions.push(ilike(profile.name, `%${input.search}%`))
  }

  return db
    .select({
      id: profile.id,
      name: profile.name,
      ownerId: profile.ownerId,
      madhab: profile.madhab,
      nisabBenchmark: profile.nisabBenchmark,
      createdAt: profile.createdAt,
      updatedAt: profile.updatedAt,
      grantedAt: profilePermission.createdAt,
      grantedByUserId: profilePermission.grantedByUserId,
    })
    .from(profilePermission)
    .innerJoin(profile, eq(profilePermission.profileId, profile.id))
    .where(and(...conditions))
    .orderBy(asc(profile.name), asc(profile.id))
    .limit(input.pageSize)
    .offset((input.page - 1) * input.pageSize)
}

export async function listAccessibleProfilePageRecords(
  ownerId: string,
  input: {
    page: number
    pageSize: number
    search: string
  },
) {
  const search = input.search.trim()
  const ownedConditions = [eq(profile.ownerId, ownerId)]
  if (search) {
    ownedConditions.push(ilike(profile.name, `%${search}%`))
  }

  const delegatedConditions = [eq(profilePermission.userId, ownerId)]
  if (search) {
    delegatedConditions.push(ilike(profile.name, `%${search}%`))
  }

  const ownedProfiles = db
    .select({
      id: profile.id,
      name: profile.name,
      ownerId: profile.ownerId,
      madhab: profile.madhab,
      nisabBenchmark: profile.nisabBenchmark,
      createdAt: profile.createdAt,
      updatedAt: profile.updatedAt,
      role: sql<ProfileAccessRole>`'owner'`.as("role"),
      canManageAccess: sql<boolean>`true`.as("can_manage_access"),
      accessGrantedAt: sql<Date | null>`null`.as("access_granted_at"),
      grantedByUserId: sql<string | null>`null`.as("granted_by_user_id"),
      sortRole: sql<number>`0`.as("sort_role"),
    })
    .from(profile)
    .where(and(...ownedConditions))

  const delegatedProfiles = db
    .select({
      id: profile.id,
      name: profile.name,
      ownerId: profile.ownerId,
      madhab: profile.madhab,
      nisabBenchmark: profile.nisabBenchmark,
      createdAt: profile.createdAt,
      updatedAt: profile.updatedAt,
      role: sql<ProfileAccessRole>`'manager'`.as("role"),
      canManageAccess: sql<boolean>`false`.as("can_manage_access"),
      accessGrantedAt: profilePermission.createdAt,
      grantedByUserId: profilePermission.grantedByUserId,
      sortRole: sql<number>`1`.as("sort_role"),
    })
    .from(profilePermission)
    .innerJoin(profile, eq(profilePermission.profileId, profile.id))
    .where(and(...delegatedConditions))

  const accessibleProfiles = ownedProfiles.unionAll(delegatedProfiles).as(
    "accessible_profiles",
  )

  const rows = await db
    .select({
      id: accessibleProfiles.id,
      name: accessibleProfiles.name,
      ownerId: accessibleProfiles.ownerId,
      madhab: accessibleProfiles.madhab,
      nisabBenchmark: accessibleProfiles.nisabBenchmark,
      createdAt: accessibleProfiles.createdAt,
      updatedAt: accessibleProfiles.updatedAt,
      role: accessibleProfiles.role,
      canManageAccess: accessibleProfiles.canManageAccess,
      accessGrantedAt: accessibleProfiles.accessGrantedAt,
      grantedByUserId: accessibleProfiles.grantedByUserId,
      sortRole: accessibleProfiles.sortRole,
    })
    .from(accessibleProfiles)
    .orderBy(
      asc(accessibleProfiles.sortRole),
      asc(accessibleProfiles.name),
      asc(accessibleProfiles.id),
    )
    .limit(input.pageSize + 1)
    .offset((input.page - 1) * input.pageSize)

  return rows
}

export async function getProfileRecordById(profileId: string) {
  const [record] = await db
    .select({
      id: profile.id,
      name: profile.name,
      ownerId: profile.ownerId,
      madhab: profile.madhab,
      nisabBenchmark: profile.nisabBenchmark,
      createdAt: profile.createdAt,
      updatedAt: profile.updatedAt,
    })
    .from(profile)
    .where(eq(profile.id, profileId))
    .limit(1)

  return record ?? null
}

export async function getProfileAccessGrantRecord(
  profileId: string,
  userId: string,
) {
  const [record] = await db
    .select({
      id: profilePermission.id,
      profileId: profilePermission.profileId,
      userId: profilePermission.userId,
      grantedByUserId: profilePermission.grantedByUserId,
      permission: profilePermission.permission,
      createdAt: profilePermission.createdAt,
    })
    .from(profilePermission)
    .where(
      and(
        eq(profilePermission.profileId, profileId),
        eq(profilePermission.userId, userId),
      ),
    )
    .limit(1)

  return record ?? null
}

export async function listProfileAccessGrantPageRecords(
  profileId: string,
  input: {
    page: number
    pageSize: number
  },
) {
  return db
    .select({
      id: profilePermission.id,
      profileId: profilePermission.profileId,
      userId: profilePermission.userId,
      userEmail: user.email,
      grantedByUserId: profilePermission.grantedByUserId,
      permission: profilePermission.permission,
      createdAt: profilePermission.createdAt,
    })
    .from(profilePermission)
    .innerJoin(user, eq(profilePermission.userId, user.id))
    .where(eq(profilePermission.profileId, profileId))
    .orderBy(desc(profilePermission.createdAt))
    .limit(input.pageSize)
    .offset((input.page - 1) * input.pageSize)
}

export async function createProfileRecord(
  ownerId: string,
  name: string,
  madhab: FiqhMadhabCode,
  nisabBenchmark: FiqhNisabBenchmarkCode,
) {
  const values = {
    id: crypto.randomUUID(),
    ownerId,
    name,
    madhab,
    nisabBenchmark,
  } satisfies typeof profile.$inferInsert

  const [record] = await db
    .insert(profile)
    .values(values)
    .returning({
      id: profile.id,
      name: profile.name,
      ownerId: profile.ownerId,
      madhab: profile.madhab,
      nisabBenchmark: profile.nisabBenchmark,
      createdAt: profile.createdAt,
      updatedAt: profile.updatedAt,
    })

  return record
}

export async function updateProfileRecord(
  profileId: string,
  name: string,
  madhab: FiqhMadhabCode,
  nisabBenchmark: FiqhNisabBenchmarkCode,
) {
  const [record] = await db
    .update(profile)
    .set({
      name,
      madhab,
      nisabBenchmark,
      updatedAt: new Date(),
    })
    .where(eq(profile.id, profileId))
    .returning({
      id: profile.id,
      name: profile.name,
      ownerId: profile.ownerId,
      madhab: profile.madhab,
      nisabBenchmark: profile.nisabBenchmark,
      createdAt: profile.createdAt,
      updatedAt: profile.updatedAt,
    })

  return record ?? null
}

export async function deleteProfileRecord(profileId: string) {
  const [record] = await db
    .delete(profile)
    .where(eq(profile.id, profileId))
    .returning({
      id: profile.id,
    })

  return record ?? null
}

export async function findUserRecordByEmail(email: string) {
  const [record] = await db
    .select({
      id: user.id,
      email: user.email,
      activeProfileId: user.activeProfileId,
    })
    .from(user)
    .where(ilike(user.email, email))
    .limit(1)

  return record ?? null
}

export async function getUserRecordById(userId: string) {
  const [record] = await db
    .select({
      id: user.id,
      email: user.email,
      activeProfileId: user.activeProfileId,
    })
    .from(user)
    .where(eq(user.id, userId))
    .limit(1)

  return record ?? null
}

export async function updateUserActiveProfileRecord(
  userId: string,
  activeProfileId: string | null,
) {
  const [record] = await db
    .update(user)
    .set({
      activeProfileId,
      updatedAt: new Date(),
    })
    .where(eq(user.id, userId))
    .returning({
      id: user.id,
      email: user.email,
      activeProfileId: user.activeProfileId,
    })

  return record ?? null
}

export async function upsertProfileAccessGrantRecord(
  profileId: string,
  userId: string,
  grantedByUserId: string,
) {
  const [record] = await db
    .insert(profilePermission)
    .values({
      id: crypto.randomUUID(),
      profileId,
      userId,
      grantedByUserId,
      permission: "manager",
    })
    .onConflictDoUpdate({
      target: [profilePermission.profileId, profilePermission.userId],
      set: {
        grantedByUserId,
        permission: "manager",
      },
    })
    .returning({
      id: profilePermission.id,
      profileId: profilePermission.profileId,
      userId: profilePermission.userId,
      grantedByUserId: profilePermission.grantedByUserId,
      permission: profilePermission.permission,
      createdAt: profilePermission.createdAt,
    })

  return record
}

export async function deleteProfileAccessGrantRecord(
  profileId: string,
  userId: string,
) {
  return db
    .delete(profilePermission)
    .where(
      and(
        eq(profilePermission.profileId, profileId),
        eq(profilePermission.userId, userId),
      ),
    )
    .returning({
      id: profilePermission.id,
    })
}
