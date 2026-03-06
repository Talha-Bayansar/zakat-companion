import { registerPushSubscription } from '@/server/functions/notifications/register-push-subscription'

export async function POST({ request }: { request: Request }) {
  const payload = (await request.json()) as {
    userId: string
    endpoint: string
    keys: { p256dh: string; auth: string }
  }

  const result = await registerPushSubscription({ data: payload })
  return Response.json(result)
}
