import { and, desc, eq, ilike } from "drizzle-orm"

import { db } from "@/server/db/client"
import {
  profile,
  profilePermission,
  user,
} from "@/server/db/schema"

export type ProfileRecord = {
  id: string
  name: string
  ownerId: string
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

export type UserRecord = {
  id: string
  email: string
}

export async function listOwnedProfileRecords(ownerId: string) {
  return db
    .select({
      id: profile.id,
      name: profile.name,
      ownerId: profile.ownerId,
      createdAt: profile.createdAt,
      updatedAt: profile.updatedAt,
    })
    .from(profile)
    .where(eq(profile.ownerId, ownerId))
    .orderBy(desc(profile.updatedAt), desc(profile.createdAt))
}

export async function listDelegatedProfileRecords(userId: string) {
  return db
    .select({
      id: profile.id,
      name: profile.name,
      ownerId: profile.ownerId,
      createdAt: profile.createdAt,
      updatedAt: profile.updatedAt,
      grantedAt: profilePermission.createdAt,
      grantedByUserId: profilePermission.grantedByUserId,
    })
    .from(profilePermission)
    .innerJoin(profile, eq(profilePermission.profileId, profile.id))
    .where(eq(profilePermission.userId, userId))
    .orderBy(desc(profilePermission.createdAt))
}

export async function getProfileRecordById(profileId: string) {
  const [record] = await db
    .select({
      id: profile.id,
      name: profile.name,
      ownerId: profile.ownerId,
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

export async function createProfileRecord(ownerId: string, name: string) {
  const [record] = await db
    .insert(profile)
    .values({
      id: crypto.randomUUID(),
      ownerId,
      name,
    })
    .returning({
      id: profile.id,
      name: profile.name,
      ownerId: profile.ownerId,
      createdAt: profile.createdAt,
      updatedAt: profile.updatedAt,
    })

  return record
}

export async function findUserRecordByEmail(email: string) {
  const [record] = await db
    .select({
      id: user.id,
      email: user.email,
    })
    .from(user)
    .where(ilike(user.email, email))
    .limit(1)

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
