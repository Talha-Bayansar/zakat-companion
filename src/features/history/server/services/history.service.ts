import { resolveCurrentActiveProfile } from "@/features/profiles/server/services/profile-access.service"

import type { HistoryCycleHistoryPage } from "../../lib/history.types"
import { listHistoryCycleRecordsByProfileId } from "../repositories/history.repository"
import type { ListHistoryCyclesInput } from "../schemas/history.schema"

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
