import { m } from "@/paraglide/messages"
import { resolveCurrentActiveProfile } from "@/features/profiles/server/services/profile-access.service"
import { orchestrateCyclePayment } from "@/features/reminders/server/services/reminder-orchestration.service"

import type { HistoryCycleHistoryPage } from "../../lib/history.types"
import {
  listHistoryCycleRecordsByProfileId,
  markHistoryCyclePaidRecord,
} from "../repositories/history.repository"
import type {
  ListHistoryCyclesInput,
  MarkHistoryCyclePaidInput,
} from "../schemas/history.schema"

type ActiveProfile = {
  id: string
  ownerId: string
  role: "owner" | "manager"
}

type Actor = {
  userId: string
  activeProfileId: string | null
}

async function requireCurrentActiveProfile(actor: Actor) {
  const profile = (await resolveCurrentActiveProfile(actor)) as ActiveProfile | null

  return profile
}

async function requireCurrentActiveProfileId(actor: Actor) {
  const profile = await requireCurrentActiveProfile(actor)

  return profile?.id ?? null
}

export async function listHistoryCycles(
  actor: Actor,
  input: ListHistoryCyclesInput,
): Promise<HistoryCycleHistoryPage> {
  const profileId = await requireCurrentActiveProfileId(actor)

  if (!profileId) {
    return {
      items: [],
      page: input.page,
      pageSize: input.pageSize,
      hasMore: false,
    }
  }

  return listHistoryCycleRecordsByProfileId(profileId, input)
}

export class HistoryServiceError extends Error {
  readonly code: "NO_ACTIVE_PROFILE" | "NOT_FOUND"

  constructor(code: HistoryServiceError["code"], message: string) {
    super(message)
    this.name = "HistoryServiceError"
    this.code = code
  }
}

export async function markCyclePaid(
  actor: Actor,
  input: MarkHistoryCyclePaidInput,
) {
  const profileId = await requireCurrentActiveProfileId(actor)

  if (!profileId) {
    throw new HistoryServiceError(
      "NO_ACTIVE_PROFILE",
      m.history_mark_cycle_paid_no_active_profile(),
    )
  }

  const paidAt = new Date()
  const record = await orchestrateCyclePayment(async (database) =>
    markHistoryCyclePaidRecord(
      profileId,
      input.zakatCycleId,
      paidAt,
      database,
    ),
  )

  if (!record) {
    throw new HistoryServiceError(
      "NOT_FOUND",
      m.history_mark_cycle_paid_not_found(),
    )
  }

  return record
}
