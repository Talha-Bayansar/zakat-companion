import { unregisterPushSubscription } from '@/server/functions/notifications/unregister-push-subscription'

export async function POST({ request }: { request: Request }) {
  const payload = (await request.json()) as {
    userId: string
    endpoint: string
  }

  const result = await unregisterPushSubscription({ data: payload })
  return Response.json(result)
}
