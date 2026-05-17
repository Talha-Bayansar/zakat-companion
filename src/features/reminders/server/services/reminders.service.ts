import { m } from "@/paraglide/messages"
import { resolveCurrentActiveProfile } from "@/features/profiles/server/services/profile-access.service"

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
  createDefaultReminderPreferenceRecord,
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
      m.profile_access_owner_only(),
    )
  }

  return profile
}

async function requireZakatCycle(profileId: string, zakatCycleId: string) {
  const zakatCycle = await getZakatCycleRecordById(zakatCycleId)

  if (!zakatCycle || zakatCycle.profileId !== profileId) {
    throw new ReminderServiceError(
      "NOT_FOUND",
      m.reminder_zakat_cycle_not_found(),
    )
  }

  return zakatCycle
}

export async function getReminderPreference(actor: Actor) {
  const profile = await requireOwnerActiveProfile(actor)

  if (!profile) {
    return null
  }

  const record = await getReminderPreferenceRecordByProfileId(profile.id)

  if (record) {
    return record
  }

  return createDefaultReminderPreferenceRecord(profile.id)
}

export async function updateReminderPreference(
  actor: Actor,
  input: ReminderPreferenceUpdateInput,
) {
  const profile = await requireOwnerActiveProfile(actor)

  if (!profile) {
    throw new ReminderServiceError(
      "NO_ACTIVE_PROFILE",
      m.reminder_preferences_no_active_profile(),
    )
  }

  const parsed = reminderPreferenceUpdateInputSchema.parse(input)

  return upsertReminderPreferenceRecord(profile.id, parsed)
}

async function requireActiveReminderProfile(actor: Actor) {
  const profile = await requireOwnerActiveProfile(actor)

  if (!profile) {
    throw new ReminderServiceError(
      "NO_ACTIVE_PROFILE",
      m.reminder_preferences_no_active_profile(),
    )
  }

  return profile
}

export async function createBalanceUpdateReminderJob(
  actor: Actor,
  input: BalanceUpdateReminderJobInput,
) {
  const parsed = balanceUpdateReminderJobInputSchema.parse(input)
  const profile = await requireActiveReminderProfile(actor)

  return createBalanceUpdateReminderJobRecord({
    profileId: profile.id,
    scheduledFor: parsed.scheduledFor,
  })
}

export async function createZakatDueReminderJob(
  actor: Actor,
  input: ZakatDueReminderJobInput,
) {
  const parsed = zakatDueReminderJobInputSchema.parse(input)
  const profile = await requireActiveReminderProfile(actor)

  await requireZakatCycle(profile.id, parsed.zakatCycleId)

  return createZakatDueReminderJobRecord({
    profileId: profile.id,
    zakatCycleId: parsed.zakatCycleId,
    phase: parsed.phase,
    scheduledFor: parsed.scheduledFor,
  })
}

export async function createReminderJob(actor: Actor, input: ReminderJobInput) {
  const parsed = reminderJobInputSchema.parse(input)

  if (parsed.kind === "balance_update") {
    return createBalanceUpdateReminderJob(actor, parsed)
  }

  return createZakatDueReminderJob(actor, parsed)
}

export async function createZakatCycle(input: CreateZakatCycleInput) {
  const parsed = createZakatCycleInputSchema.parse(input)

  return createZakatCycleRecord(parsed)
}

export async function claimDueReminderJobs(now = new Date()) {
  return claimDueReminderJobRecords(now)
}
