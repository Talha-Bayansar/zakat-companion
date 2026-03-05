import { and, eq } from 'drizzle-orm'
import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { db } from '@/server/db'
import { pushSubscriptions } from '@/server/db/schema'

const pushSubscriptionSchema = z.object({
  userId: z.string().min(1),
  endpoint: z.string().url(),
  keys: z.object({
    p256dh: z.string(),
    auth: z.string(),
  }),
})

export const registerPushSubscription = createServerFn({ method: 'POST' })
  .inputValidator(pushSubscriptionSchema)
  .handler(async ({ data }) => {
    const existing = await db.query.pushSubscriptions.findFirst({
      where: and(eq(pushSubscriptions.userId, data.userId), eq(pushSubscriptions.endpoint, data.endpoint)),
    })

    if (existing) {
      await db
        .update(pushSubscriptions)
        .set({
          p256dh: data.keys.p256dh,
          auth: data.keys.auth,
          updatedAt: new Date(),
        })
        .where(eq(pushSubscriptions.id, existing.id))

      return { saved: true, endpoint: data.endpoint, existed: true }
    }

    await db.insert(pushSubscriptions).values({
      userId: data.userId,
      endpoint: data.endpoint,
      p256dh: data.keys.p256dh,
      auth: data.keys.auth,
    })

    return { saved: true, endpoint: data.endpoint, existed: false }
  })
