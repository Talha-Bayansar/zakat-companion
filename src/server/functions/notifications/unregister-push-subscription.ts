import { and, eq } from 'drizzle-orm'
import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { db } from '@/server/db'
import { pushSubscriptions } from '@/server/db/schema'

const unregisterInput = z.object({
  userId: z.string().min(1),
  endpoint: z.string().url(),
})

export const unregisterPushSubscription = createServerFn({ method: 'POST' })
  .inputValidator(unregisterInput)
  .handler(async ({ data }) => {
    await db
      .delete(pushSubscriptions)
      .where(and(eq(pushSubscriptions.userId, data.userId), eq(pushSubscriptions.endpoint, data.endpoint)))

    return { ok: true }
  })
