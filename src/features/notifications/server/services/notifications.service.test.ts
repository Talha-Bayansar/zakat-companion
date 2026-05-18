import { beforeEach, describe, expect, it, vi } from "vitest"

const resolveCurrentActiveProfile = vi.fn()
const getNotificationSubscriptionRecordById = vi.fn()
const listActiveNotificationSubscriptionRecordsByProfileId = vi.fn()
const listNotificationDeliveryAttemptRecordsByReminderJobId = vi.fn()
const listNotificationSubscriptionRecordsByProfileId = vi.fn()
const upsertNotificationSubscriptionRecord = vi.fn()
const disableNotificationSubscriptionRecord = vi.fn()
const expireNotificationSubscriptionRecord = vi.fn()
const failNotificationSubscriptionRecord = vi.fn()
const recordNotificationDeliveryAttemptRecord = vi.fn()
const sendWebPushNotification = vi.fn()
const getWebPushErrorMessage = vi.fn(() => "push failed")
const isNotificationSubscriptionExpiredError = vi.fn(() => false)
const isNotificationSubscriptionPermanentFailure = vi.fn(() => false)

vi.mock("@/features/profiles/server/services/profile-access.service", () => ({
  resolveCurrentActiveProfile,
}))

vi.mock("../repositories/notifications.repository", () => ({
  disableNotificationSubscriptionRecord,
  expireNotificationSubscriptionRecord,
  failNotificationSubscriptionRecord,
  getNotificationSubscriptionRecordById,
  listActiveNotificationSubscriptionRecordsByProfileId,
  listNotificationDeliveryAttemptRecordsByReminderJobId,
  listNotificationSubscriptionRecordsByProfileId,
  recordNotificationDeliveryAttemptRecord,
  upsertNotificationSubscriptionRecord,
}))

vi.mock("./web-push-delivery.service", () => ({
  getWebPushErrorMessage,
  isNotificationSubscriptionExpiredError,
  isNotificationSubscriptionPermanentFailure,
  sendWebPushNotification,
  WebPushDeliveryError: class WebPushDeliveryError extends Error {
    readonly code: "NOT_CONFIGURED" | "SEND_FAILED"
    readonly statusCode: number | null

    constructor(
      code: "NOT_CONFIGURED" | "SEND_FAILED",
      message: string,
      statusCode: number | null = null,
    ) {
      super(message)
      this.name = "WebPushDeliveryError"
      this.code = code
      this.statusCode = statusCode
    }
  },
}))

import {
  registerNotificationSubscription,
  removeNotificationSubscription,
  sendNotificationPayloadToProfile,
} from "./notifications.service"

const actor = {
  userId: "user-1",
  activeProfileId: "profile-1",
}

const subscription = {
  id: "subscription-1",
  profileId: "profile-1",
  channel: "web_push",
  endpoint: "https://push.example.test/subscriptions/abc",
  keys: {
    auth: "auth-key",
    p256dh: "p256dh-key",
  },
  status: "active",
  expiresAt: null,
  disabledAt: null,
  expiredAt: null,
  failedAt: null,
  lastFailureReason: null,
  createdAt: new Date("2026-05-17T09:00:00.000Z"),
  updatedAt: new Date("2026-05-17T09:00:00.000Z"),
}

beforeEach(() => {
  vi.clearAllMocks()
  getWebPushErrorMessage.mockReturnValue("push failed")
  isNotificationSubscriptionExpiredError.mockReturnValue(false)
  isNotificationSubscriptionPermanentFailure.mockReturnValue(false)
  resolveCurrentActiveProfile.mockResolvedValue({
    id: "profile-1",
    ownerId: "user-1",
    role: "owner",
  })
})

describe("notifications service", () => {
  it("stores subscriptions for the active owned profile", async () => {
    upsertNotificationSubscriptionRecord.mockResolvedValue(subscription)

    await registerNotificationSubscription(actor, {
      channel: "web_push",
      endpoint: subscription.endpoint,
      keys: subscription.keys,
      expiresAt: null,
    })

    expect(upsertNotificationSubscriptionRecord).toHaveBeenCalledWith({
      profileId: "profile-1",
      channel: "web_push",
      endpoint: subscription.endpoint,
      keys: subscription.keys,
      expiresAt: null,
    })
  })

  it("disables an owned subscription on removal", async () => {
    getNotificationSubscriptionRecordById.mockResolvedValue(subscription)
    disableNotificationSubscriptionRecord.mockResolvedValue({
      ...subscription,
      status: "disabled",
      disabledAt: new Date("2026-05-17T09:10:00.000Z"),
      updatedAt: new Date("2026-05-17T09:10:00.000Z"),
    })

    await removeNotificationSubscription(actor, {
      subscriptionId: "subscription-1",
    })

    expect(disableNotificationSubscriptionRecord).toHaveBeenCalledWith(
      "subscription-1",
    )
  })

  it("persists delivery attempts for reminder-driven push sends", async () => {
    listActiveNotificationSubscriptionRecordsByProfileId.mockResolvedValue([
      subscription,
    ])
    listNotificationDeliveryAttemptRecordsByReminderJobId.mockResolvedValue([])
    sendWebPushNotification.mockResolvedValue({ statusCode: 201 })
    recordNotificationDeliveryAttemptRecord.mockResolvedValue({
      id: "attempt-1",
    })

    const result = await sendNotificationPayloadToProfile(
      "profile-1",
      "reminder-job-1",
      {
        channel: "web_push",
        kind: "balance_update",
        profileId: "profile-1",
        title: "Balance update",
        body: "Refresh your wealth snapshot.",
        url: "/settings",
        tag: "balance-update:profile-1",
      },
      new Date("2026-05-17T09:15:00.000Z"),
    )

    expect(sendWebPushNotification).toHaveBeenCalledWith(subscription, {
      channel: "web_push",
      kind: "balance_update",
      profileId: "profile-1",
      title: "Balance update",
      body: "Refresh your wealth snapshot.",
      url: "/settings",
      tag: "balance-update:profile-1",
    })
    expect(recordNotificationDeliveryAttemptRecord).toHaveBeenCalledWith(
      expect.objectContaining({
        profileId: "profile-1",
        reminderJobId: "reminder-job-1",
        subscriptionId: "subscription-1",
        status: "succeeded",
      }),
    )
    expect(result).toMatchObject({
      profileId: "profile-1",
      reminderJobId: "reminder-job-1",
      attemptedCount: 1,
      succeededCount: 1,
      failedCount: 0,
      expiredCount: 0,
    })
  })

  it("skips subscriptions that already succeeded for the reminder job", async () => {
    const secondSubscription = {
      ...subscription,
      id: "subscription-2",
      endpoint: "https://push.example.test/subscriptions/def",
    }
    listActiveNotificationSubscriptionRecordsByProfileId.mockResolvedValue([
      subscription,
      secondSubscription,
    ])
    listNotificationDeliveryAttemptRecordsByReminderJobId.mockResolvedValue([
      {
        id: "attempt-1",
        profileId: "profile-1",
        reminderJobId: "reminder-job-1",
        subscriptionId: "subscription-1",
        channel: "web_push",
        kind: "balance_update",
        status: "succeeded",
        payload: "{}",
        attemptedAt: new Date("2026-05-17T09:15:00.000Z"),
        deliveredAt: new Date("2026-05-17T09:15:01.000Z"),
        errorMessage: null,
        createdAt: new Date("2026-05-17T09:15:00.000Z"),
        updatedAt: new Date("2026-05-17T09:15:00.000Z"),
      },
    ])
    sendWebPushNotification.mockResolvedValue({ statusCode: 201 })
    recordNotificationDeliveryAttemptRecord.mockResolvedValue({
      id: "attempt-2",
    })

    const result = await sendNotificationPayloadToProfile(
      "profile-1",
      "reminder-job-1",
      {
        channel: "web_push",
        kind: "balance_update",
        profileId: "profile-1",
        title: "Balance update",
        body: "Refresh your wealth snapshot.",
        url: "/settings",
        tag: "balance-update:profile-1",
      },
      new Date("2026-05-17T09:15:00.000Z"),
    )

    expect(sendWebPushNotification).toHaveBeenCalledTimes(1)
    expect(sendWebPushNotification).toHaveBeenCalledWith(secondSubscription, {
      channel: "web_push",
      kind: "balance_update",
      profileId: "profile-1",
      title: "Balance update",
      body: "Refresh your wealth snapshot.",
      url: "/settings",
      tag: "balance-update:profile-1",
    })
    expect(result).toMatchObject({
      attemptedCount: 1,
      succeededCount: 1,
      failedCount: 0,
      expiredCount: 0,
    })
  })

  it("skips inactive subscriptions when there are no active records", async () => {
    listActiveNotificationSubscriptionRecordsByProfileId.mockResolvedValue([])
    listNotificationDeliveryAttemptRecordsByReminderJobId.mockResolvedValue([])

    const result = await sendNotificationPayloadToProfile(
      "profile-1",
      "reminder-job-1",
      {
        channel: "web_push",
        kind: "balance_update",
        profileId: "profile-1",
        title: "Balance update",
        body: "Refresh your wealth snapshot.",
        url: "/settings",
        tag: "balance-update:profile-1",
      },
      new Date("2026-05-17T09:15:00.000Z"),
    )

    expect(sendWebPushNotification).not.toHaveBeenCalled()
    expect(recordNotificationDeliveryAttemptRecord).not.toHaveBeenCalled()
    expect(result).toMatchObject({
      attemptedCount: 0,
      succeededCount: 0,
      failedCount: 0,
      expiredCount: 0,
    })
  })

  it("expires subscriptions after a push delivery returns a 410 error", async () => {
    listActiveNotificationSubscriptionRecordsByProfileId.mockResolvedValue([
      subscription,
    ])
    listNotificationDeliveryAttemptRecordsByReminderJobId.mockResolvedValue([])
    isNotificationSubscriptionExpiredError.mockReturnValue(true)
    isNotificationSubscriptionPermanentFailure.mockReturnValue(false)
    getWebPushErrorMessage.mockReturnValue("subscription expired")
    sendWebPushNotification.mockRejectedValue({
      statusCode: 410,
    })

    const result = await sendNotificationPayloadToProfile(
      "profile-1",
      "reminder-job-1",
      {
        channel: "web_push",
        kind: "balance_update",
        profileId: "profile-1",
        title: "Balance update",
        body: "Refresh your wealth snapshot.",
        url: "/settings",
        tag: "balance-update:profile-1",
      },
      new Date("2026-05-17T09:15:00.000Z"),
    )

    expect(expireNotificationSubscriptionRecord).toHaveBeenCalledWith(
      "subscription-1",
      new Date("2026-05-17T09:15:00.000Z"),
      "subscription expired",
    )
    expect(failNotificationSubscriptionRecord).not.toHaveBeenCalled()
    expect(result).toMatchObject({
      attemptedCount: 1,
      succeededCount: 0,
      failedCount: 0,
      expiredCount: 1,
      firstFailureMessage: "subscription expired",
    })
  })

  it("marks subscriptions failed after a permanent push delivery error", async () => {
    listActiveNotificationSubscriptionRecordsByProfileId.mockResolvedValue([
      subscription,
    ])
    listNotificationDeliveryAttemptRecordsByReminderJobId.mockResolvedValue([])
    isNotificationSubscriptionExpiredError.mockReturnValue(false)
    isNotificationSubscriptionPermanentFailure.mockReturnValue(true)
    getWebPushErrorMessage.mockReturnValue("permission revoked")
    sendWebPushNotification.mockRejectedValue({
      statusCode: 403,
    })

    const result = await sendNotificationPayloadToProfile(
      "profile-1",
      "reminder-job-1",
      {
        channel: "web_push",
        kind: "balance_update",
        profileId: "profile-1",
        title: "Balance update",
        body: "Refresh your wealth snapshot.",
        url: "/settings",
        tag: "balance-update:profile-1",
      },
      new Date("2026-05-17T09:15:00.000Z"),
    )

    expect(failNotificationSubscriptionRecord).toHaveBeenCalledWith(
      "subscription-1",
      new Date("2026-05-17T09:15:00.000Z"),
      "permission revoked",
    )
    expect(expireNotificationSubscriptionRecord).not.toHaveBeenCalled()
    expect(result).toMatchObject({
      attemptedCount: 1,
      succeededCount: 0,
      failedCount: 1,
      expiredCount: 0,
      firstFailureMessage: "permission revoked",
    })
  })
})
