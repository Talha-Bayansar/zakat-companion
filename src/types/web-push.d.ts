declare module "web-push" {
  export type WebPushSubscription = {
    endpoint: string
    keys: {
      auth: string
      p256dh: string
    }
    expirationTime?: number | undefined
  }

  export type WebPushResponse = {
    body?: string
    headers?: Record<string, string | string[]>
    statusCode: number
  }

  export type WebPushError = Error & {
    body?: string
    headers?: Record<string, string | string[]>
    statusCode?: number
  }

  export type WebPushDeliveryOptions = {
    TTL?: number
    urgency?: "very-low" | "low" | "normal" | "high"
  }

  export interface WebPushClient {
    sendNotification(
      subscription: WebPushSubscription,
      payload?: string | Buffer,
      options?: WebPushDeliveryOptions,
    ): Promise<WebPushResponse>
    setVapidDetails(
      subject: string,
      publicKey: string,
      privateKey: string,
    ): void
  }

  const webpush: WebPushClient

  export default webpush
}
