import { describe, expect, it } from "vitest"

import {
  notificationChannelValues,
  notificationDeliveryKindValues,
} from "./notifications.constants"
import {
  notificationDeliveryPayloadSchema,
  notificationSubscriptionSchema,
} from "./notifications.schemas"

describe("notification contract", () => {
  it("freezes the canonical notification delivery values", () => {
    expect(notificationChannelValues).toEqual(["web_push"])
    expect(notificationDeliveryKindValues).toEqual([
      "balance_update",
      "zakat_due",
    ])
  })

  it("treats push subscriptions as profile-scoped web push records", () => {
    expect(
      notificationSubscriptionSchema.parse({
        profileId: "profile-1",
        channel: "web_push",
        endpoint: "https://push.example.test/subscriptions/abc",
        keys: {
          auth: "auth-key",
          p256dh: "p256dh-key",
        },
        createdAt: new Date("2026-05-17T09:00:00.000Z"),
        updatedAt: new Date("2026-05-17T09:00:00.000Z"),
      }),
    ).toMatchObject({
      profileId: "profile-1",
      channel: "web_push",
    })
  })

  it("validates web push delivery payloads for reminder jobs", () => {
    expect(
      notificationDeliveryPayloadSchema.parse({
        channel: "web_push",
        kind: "zakat_due",
        profileId: "profile-1",
        title: "Zakat is due",
        body: "Your current cycle is due today.",
        url: "/history",
        tag: "zakat-due:profile-1",
      }),
    ).toMatchObject({
      kind: "zakat_due",
      channel: "web_push",
    })
  })
})
