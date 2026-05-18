import { createServerFn } from "@tanstack/react-start"
import { getRequest } from "@tanstack/react-start/server"

import { m } from "@/paraglide/messages"

import {
  notificationSubscriptionRegistrationInputSchema,
  notificationSubscriptionRemovalInputSchema,
  notificationSubscriptionTestDeliveryInputSchema,
} from "../schemas/notifications.schema"

async function requireActor() {
  const { auth } = await import("@/server/auth")
  const session = await auth.api.getSession({
    headers: getRequest().headers,
  })

  const userId = session?.user?.id

  if (!userId) {
    const { NotificationServiceError } = await import(
      "../services/notifications.service"
    )

    throw new NotificationServiceError(
      "UNAUTHENTICATED",
      m.notification_sign_in_required(),
    )
  }

  const { getUserRecordById } = await import(
    "@/features/profiles/server/repositories/profile-access.repository"
  )
  const userRecord = await getUserRecordById(userId)

  return {
    userId,
    activeProfileId: userRecord?.activeProfileId ?? null,
  }
}

export const listNotificationSubscriptionsFn = createServerFn({ method: "GET" })
  .handler(async () => {
    const actor = await requireActor()
    const { listNotificationSubscriptions } = await import(
      "../services/notifications.service"
    )

    return listNotificationSubscriptions(actor)
  })

export const registerNotificationSubscriptionFn = createServerFn({
  method: "POST",
})
  .inputValidator(notificationSubscriptionRegistrationInputSchema)
  .handler(async ({ data }) => {
    const actor = await requireActor()
    const { registerNotificationSubscription } = await import(
      "../services/notifications.service"
    )

    return registerNotificationSubscription(actor, data)
  })

export const removeNotificationSubscriptionFn = createServerFn({ method: "POST" })
  .inputValidator(notificationSubscriptionRemovalInputSchema)
  .handler(async ({ data }) => {
    const actor = await requireActor()
    const { removeNotificationSubscription } = await import(
      "../services/notifications.service"
    )

    return removeNotificationSubscription(actor, data)
  })

export const sendNotificationTestDeliveryFn = createServerFn({ method: "POST" })
  .inputValidator(notificationSubscriptionTestDeliveryInputSchema)
  .handler(async ({ data }) => {
    const actor = await requireActor()
    const { sendNotificationTestDelivery } = await import(
      "../services/notifications.service"
    )

    return sendNotificationTestDelivery(actor, data)
  })
