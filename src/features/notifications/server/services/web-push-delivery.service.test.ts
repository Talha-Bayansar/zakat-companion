import { describe, expect, it, vi } from "vitest"

import { m } from "@/paraglide/messages"

vi.mock("cloudflare:workers", () => ({
  env: {},
}))

vi.mock("web-push", () => ({
  default: {
    setVapidDetails: vi.fn(),
    sendNotification: vi.fn(),
  },
}))

import {
  getWebPushErrorMessage,
  isNotificationSubscriptionExpiredError,
  isNotificationSubscriptionPermanentFailure,
} from "./web-push-delivery.service"

describe("web push delivery service helpers", () => {
  it("formats status-code failures with a localized message", () => {
    expect(getWebPushErrorMessage({ statusCode: 503 })).toBe(
      m.notification_delivery_failed_with_status({
        statusCode: "503",
      }),
    )
  })

  it("extracts plain error messages when no status code is available", () => {
    expect(getWebPushErrorMessage(new Error("push failed"))).toBe(
      "push failed",
    )
  })

  it("classifies expired subscriptions from 404 and 410 responses", () => {
    expect(isNotificationSubscriptionExpiredError({ statusCode: 404 })).toBe(
      true,
    )
    expect(isNotificationSubscriptionExpiredError({ statusCode: 410 })).toBe(
      true,
    )
    expect(isNotificationSubscriptionExpiredError({ statusCode: 403 })).toBe(
      false,
    )
  })

  it("classifies permanent failures from 400, 401, and 403 responses", () => {
    expect(
      isNotificationSubscriptionPermanentFailure({ statusCode: 400 }),
    ).toBe(true)
    expect(
      isNotificationSubscriptionPermanentFailure({ statusCode: 401 }),
    ).toBe(true)
    expect(
      isNotificationSubscriptionPermanentFailure({ statusCode: 403 }),
    ).toBe(true)
    expect(
      isNotificationSubscriptionPermanentFailure({ statusCode: 410 }),
    ).toBe(false)
  })
})
