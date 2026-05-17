import { queryOptions, useQuery } from "@tanstack/react-query"

import { getReminderPreferenceFn } from "../server/functions/reminders.function"

export const remindersQueryKey = ["reminders"] as const

export function reminderPreferenceQueryKey(profileId: string | null) {
  return [...remindersQueryKey, "preference", profileId ?? "none"] as const
}

export function reminderPreferenceQueryOptions(profileId: string | null) {
  return queryOptions({
    queryKey: reminderPreferenceQueryKey(profileId),
    queryFn: async () => getReminderPreferenceFn(),
    enabled: profileId !== null,
  })
}

export function useReminderPreferenceQuery(profileId: string | null) {
  return useQuery(reminderPreferenceQueryOptions(profileId))
}
