import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'

const pushSubscriptionSchema = z.object({
  endpoint: z.string().url(),
  keys: z.object({
    p256dh: z.string(),
    auth: z.string()
  })
})

export const registerPushSubscription = createServerFn({ method: 'POST' })
  .inputValidator(pushSubscriptionSchema)
  .handler(async ({ data }) => {
    return { saved: true, endpoint: data.endpoint }
  })
