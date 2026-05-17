import { useMutation, useQueryClient } from "@tanstack/react-query"

import { updateReminderPreferenceFn } from "../server/functions/reminders.function"
import type { ReminderPreference } from "./reminders.types"
import { remindersQueryKey } from "./reminders.query"

export function useUpdateReminderPreferenceMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (values: ReminderPreference) =>
      updateReminderPreferenceFn({ data: values }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: remindersQueryKey,
      })
    },
  })
}
