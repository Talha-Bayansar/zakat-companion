import { useMutation, useQueryClient } from "@tanstack/react-query"

import {
  registerNotificationSubscriptionFn,
  removeNotificationSubscriptionFn,
} from "../server/functions/notifications.function"
import type {
  NotificationSubscriptionRegistrationInput,
  NotificationSubscriptionRemovalInput,
} from "../server/schemas/notifications.schema"

import { notificationQueryKey } from "./notifications.query"

function invalidateNotificationQueries(
  queryClient: ReturnType<typeof useQueryClient>,
) {
  return Promise.all([
    queryClient.invalidateQueries({
      queryKey: notificationQueryKey,
    }),
  ])
}

export function useRegisterNotificationSubscriptionMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (values: NotificationSubscriptionRegistrationInput) =>
      registerNotificationSubscriptionFn({ data: values }),
    onSuccess: async () => {
      await invalidateNotificationQueries(queryClient)
    },
  })
}

export function useRemoveNotificationSubscriptionMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (values: NotificationSubscriptionRemovalInput) =>
      removeNotificationSubscriptionFn({ data: values }),
    onSuccess: async () => {
      await invalidateNotificationQueries(queryClient)
    },
  })
}

