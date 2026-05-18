// @vitest-environment jsdom

import { beforeEach, describe, expect, it, vi } from "vitest"

import {
  buildBrowserPushSubscriptionRegistration,
  getBrowserNotificationPermission,
  getCurrentBrowserPushSubscription,
  unsubscribeCurrentBrowserPushSubscription,
} from "./notifications.client"

const getRegistration = vi.fn()
const register = vi.fn()
const getSubscription = vi.fn()
const subscribe = vi.fn()
const unsubscribe = vi.fn()
const requestPermission = vi.fn()

function installBrowserPushApis() {
  Object.defineProperty(window, "PushManager", {
    configurable: true,
    value: class PushManager {},
  })

  Object.defineProperty(window, "Notification", {
    configurable: true,
    value: {
      permission: "default",
      requestPermission,
    },
  })

  Object.defineProperty(navigator, "serviceWorker", {
    configurable: true,
    value: {
      getRegistration,
      register,
    },
  })
}

beforeEach(() => {
  vi.clearAllMocks()
  installBrowserPushApis()
  getRegistration.mockResolvedValue(null)
  register.mockResolvedValue({
    pushManager: {
      getSubscription,
      subscribe,
    },
  })
  getSubscription.mockResolvedValue(null)
  subscribe.mockResolvedValue({
    toJSON: () => ({
      endpoint: "https://push.example.test/subscriptions/abc",
      expirationTime: 1_743_000_000_000,
      keys: {
        auth: "auth-key",
        p256dh: "p256dh-key",
      },
    }),
  })
  unsubscribe.mockResolvedValue(true)
  requestPermission.mockResolvedValue("granted")
})

describe("notifications client", () => {
  it("registers a browser push subscription after permission is granted", async () => {
    expect(getBrowserNotificationPermission()).toBe("default")

    const subscription = await buildBrowserPushSubscriptionRegistration(
      "BElA8x0yZxwqf1K2lS3p4q5r6t7u8v9w0x1y2z3a4b5c6d7e8f9g0h1i2j3k4l5m6n7o8p9q0",
    )

    expect(requestPermission).toHaveBeenCalledTimes(1)
    expect(getRegistration).toHaveBeenCalledWith("/")
    expect(register).toHaveBeenCalledWith("/sw.js", { scope: "/" })
    expect(subscribe).toHaveBeenCalledWith({
      userVisibleOnly: true,
      applicationServerKey: expect.any(Uint8Array),
    })
    expect(subscription).toEqual({
      endpoint: "https://push.example.test/subscriptions/abc",
      expiresAt: new Date(1_743_000_000_000),
      keys: {
        auth: "auth-key",
        p256dh: "p256dh-key",
      },
    })
  })

  it("reads the current browser subscription and unsubscribes it", async () => {
    getSubscription.mockResolvedValue({
      endpoint: "https://push.example.test/subscriptions/abc",
      unsubscribe,
    })

    await expect(getCurrentBrowserPushSubscription()).resolves.toEqual({
      endpoint: "https://push.example.test/subscriptions/abc",
      unsubscribe,
    })
    await expect(unsubscribeCurrentBrowserPushSubscription()).resolves.toBe(
      true,
    )

    expect(unsubscribe).toHaveBeenCalledTimes(1)
  })
})
