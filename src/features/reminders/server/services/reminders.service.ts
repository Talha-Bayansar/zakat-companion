import { resolveCurrentActiveProfile } from "@/features/profiles/server/services/profile-access.service"
import { getProfileRecordById } from "@/features/profiles/server/repositories/profile-access.repository"

import {
  type BalanceUpdateReminderJobInput,
  type CreateZakatCycleInput,
  type ReminderJobInput,
  type ReminderPreferenceUpdateInput,
  type ZakatDueReminderJobInput,
  balanceUpdateReminderJobInputSchema,
  createZakatCycleInputSchema,
  reminderJobInputSchema,
  reminderPreferenceUpdateInputSchema,
  zakatDueReminderJobInputSchema,
} from "../schemas/reminders.schema"
import {
  claimDueReminderJobRecords,
  createBalanceUpdateReminderJobRecord,
  createZakatDueReminderJobRecord,
  createZakatCycleRecord,
  getReminderPreferenceRecordByProfileId,
  getZakatCycleRecordById,
  upsertReminderPreferenceRecord,
} from "../repositories/reminders.repository"

type ActiveProfile = {
  id: string
  ownerId: string
  role: "owner" | "manager"
}

type Actor = {
  userId: string
  activeProfileId: string | null
}

export class ReminderServiceError extends Error {
  readonly code:
    | "UNAUTHENTICATED"
    | "NO_ACTIVE_PROFILE"
    | "FORBIDDEN"
    | "NOT_FOUND"

  constructor(
    code: ReminderServiceError["code"],
    message: string,
  ) {
    super(message)
    this.name = "ReminderServiceError"
    this.code = code
  }
}

async function requireCurrentActiveProfile(actor: Actor) {
  const profile = (await resolveCurrentActiveProfile(actor)) as ActiveProfile | null

  return profile
}

async function requireOwnerActiveProfile(actor: Actor) {
  const profile = await requireCurrentActiveProfile(actor)

  if (!profile) {
    return null
  }

  if (profile.role !== "owner") {
    throw new ReminderServiceError(
      "FORBIDDEN",
      "Reminder preferences can only be edited by the profile owner.",
    )
  }

  return profile
}

async function requireProfileExists(profileId: string) {
  const profile = await getProfileRecordById(profileId)

  if (!profile) {
    throw new ReminderServiceError("NOT_FOUND", "Profile not found.")
  }

  return profile
}

async function requireZakatCycle(profileId: string, zakatCycleId: string) {
  const zakatCycle = await getZakatCycleRecordById(zakatCycleId)

  if (!zakatCycle || zakatCycle.profileId !== profileId) {
    throw new ReminderServiceError("NOT_FOUND", "Zakat cycle not found.")
  }

  return zakatCycle
}

export async function getReminderPreference(actor: Actor) {
  const profile = await requireOwnerActiveProfile(actor)

  if (!profile) {
    return null
  }

  return getReminderPreferenceRecordByProfileId(profile.id)
}

export async function updateReminderPreference(
  actor: Actor,
  input: ReminderPreferenceUpdateInput,
) {
  const profile = await requireOwnerActiveProfile(actor)

  if (!profile) {
    throw new ReminderServiceError(
      "NO_ACTIVE_PROFILE",
      "No active profile is selected.",
    )
  }

  const parsed = reminderPreferenceUpdateInputSchema.parse(input)

  return upsertReminderPreferenceRecord(profile.id, parsed)
}

export async function createBalanceUpdateReminderJob(
  input: BalanceUpdateReminderJobInput,
) {
  const parsed = balanceUpdateReminderJobInputSchema.parse(input)

  await requireProfileExists(parsed.profileId)

  return createBalanceUpdateReminderJobRecord(parsed)
}

export async function createZakatDueReminderJob(
  input: ZakatDueReminderJobInput,
) {
  const parsed = zakatDueReminderJobInputSchema.parse(input)

  await requireZakatCycle(parsed.profileId, parsed.zakatCycleId)

  return createZakatDueReminderJobRecord(parsed)
}

export async function createReminderJob(input: ReminderJobInput) {
  const parsed = reminderJobInputSchema.parse(input)

  if (parsed.kind === "balance_update") {
    return createBalanceUpdateReminderJob(parsed)
  }

  return createZakatDueReminderJob(parsed)
}

export async function createZakatCycle(input: CreateZakatCycleInput) {
  const parsed = createZakatCycleInputSchema.parse(input)

  return createZakatCycleRecord(parsed)
}

export async function claimDueReminderJobs(now = new Date()) {
  return claimDueReminderJobRecords(now)
}
