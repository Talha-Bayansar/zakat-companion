import { queryOptions, useQuery } from "@tanstack/react-query"

import type { NotificationSubscriptionRecord } from "./notifications.types"

import {
  getNotificationVapidPublicKeyFn,
  listNotificationSubscriptionsFn,
} from "../server/functions/notifications.function"

export const notificationQueryKey = ["notifications"] as const

export function notificationSubscriptionsQueryKey(profileId: string | null) {
  return [...notificationQueryKey, "subscriptions", profileId ?? "none"] as const
}

export function notificationSubscriptionsQueryOptions(profileId: string | null) {
  return queryOptions<NotificationSubscriptionRecord[] | null>({
    queryKey: notificationSubscriptionsQueryKey(profileId),
    queryFn: async () => listNotificationSubscriptionsFn(),
    enabled: profileId !== null,
  })
}

export function useNotificationSubscriptionsQuery(profileId: string | null) {
  return useQuery(notificationSubscriptionsQueryOptions(profileId))
}

export function notificationVapidPublicKeyQueryKey() {
  return [...notificationQueryKey, "vapid-public-key"] as const
}

export function notificationVapidPublicKeyQueryOptions() {
  return queryOptions<string | null>({
    queryKey: notificationVapidPublicKeyQueryKey(),
    queryFn: async () => getNotificationVapidPublicKeyFn(),
    staleTime: 24 * 60 * 60 * 1000,
  })
}

export function useNotificationVapidPublicKeyQuery() {
  return useQuery(notificationVapidPublicKeyQueryOptions())
}
