import { useEffect, useState } from "react"

import { m } from "@/paraglide/messages"

import { useCurrentActiveProfileQuery } from "@/features/profiles"
import { Button } from "@/shared/ui/button"
import { Spinner } from "@/shared/ui/spinner"
import { Surface } from "@/shared/ui/surface"
import {
  buildBrowserPushSubscriptionRegistration,
  getBrowserNotificationPermission,
  getCurrentBrowserPushSubscription,
} from "@/features/notifications/lib/notifications.client"
import {
  useRegisterNotificationSubscriptionMutation,
} from "@/features/notifications/lib/notifications.mutations"
import { useNotificationVapidPublicKeyQuery } from "@/features/notifications/lib/notifications.query"

function getNotificationPermissionLabel(
  permission: NotificationPermission | "unsupported"
) {
  switch (permission) {
    case "granted":
      return m.settings_notifications_permission_granted()
    case "denied":
      return m.settings_notifications_permission_denied()
    case "default":
      return m.settings_notifications_permission_default()
    case "unsupported":
      return m.settings_notifications_permission_unsupported()
  }
}

export function NotificationPreferencesSection() {
  const currentActiveProfileQuery = useCurrentActiveProfileQuery()
  const activeProfile = currentActiveProfileQuery.data ?? null
  const vapidPublicKeyQuery = useNotificationVapidPublicKeyQuery()
  const registerSubscriptionMutation = useRegisterNotificationSubscriptionMutation()
  const [browserPermission, setBrowserPermission] = useState<
    NotificationPermission | "unsupported"
  >("unsupported")
  const [currentBrowserEndpoint, setCurrentBrowserEndpoint] = useState<
    string | null
  >(null)
  const [actionError, setActionError] = useState<string | null>(null)
  const [actionSuccess, setActionSuccess] = useState<string | null>(null)
  const [isConnecting, setIsConnecting] = useState(false)

  useEffect(() => {
    setBrowserPermission(getBrowserNotificationPermission())
  }, [])

  useEffect(() => {
    let cancelled = false

    async function syncCurrentBrowserSubscription() {
      if (browserPermission !== "granted") {
        setCurrentBrowserEndpoint(null)
        return
      }

      const subscription = await getCurrentBrowserPushSubscription()

      if (!cancelled) {
        setCurrentBrowserEndpoint(subscription?.endpoint ?? null)
      }
    }

    void syncCurrentBrowserSubscription()

    return () => {
      cancelled = true
    }
  }, [browserPermission])

  if (currentActiveProfileQuery.isLoading) {
    return (
      <Surface rounded="xl" padding="lg" className="space-y-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Spinner
            label={m.settings_notifications_loading()}
            className="size-4"
          />
          <span>{m.settings_notifications_loading()}</span>
        </div>
      </Surface>
    )
  }

  if (currentActiveProfileQuery.isError) {
    return (
      <p className="rounded-[1.75rem] border border-destructive/20 bg-destructive/5 px-5 py-4 text-sm leading-6 text-destructive">
        {m.settings_notifications_load_error()}
      </p>
    )
  }

  if (!activeProfile) {
    return (
      <Surface rounded="xl" padding="lg" className="space-y-4">
        <div className="flex flex-col gap-1">
          <p className="text-sm font-medium text-foreground">
            {m.settings_notifications_title()}
          </p>
          <p className="text-sm leading-6 text-muted-foreground">
            {m.settings_notifications_description()}
          </p>
        </div>

        <div className="py-6 text-center">
          <p className="text-base font-medium text-foreground">
            {m.settings_notifications_no_active_profile_title()}
          </p>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            {m.settings_notifications_no_active_profile_description()}
          </p>
        </div>
      </Surface>
    )
  }

  if (!activeProfile.canManageAccess) {
    return null
  }
  const vapidPublicKey = vapidPublicKeyQuery.data ?? null
  const canEnableNotifications =
    Boolean(vapidPublicKey) &&
    browserPermission !== "unsupported" &&
    browserPermission !== "denied"
  const isPermissionDenied = browserPermission === "denied"
  const isNotificationsUnsupported = browserPermission === "unsupported"

  async function handleEnableNotifications() {
    if (!vapidPublicKey) {
      setActionError(m.settings_notifications_not_configured())
      return
    }

    setActionError(null)
    setActionSuccess(null)
    setIsConnecting(true)

    try {
      const subscription =
        await buildBrowserPushSubscriptionRegistration(vapidPublicKey)

      await registerSubscriptionMutation.mutateAsync({
        channel: "web_push",
        ...subscription,
      })

      setBrowserPermission("granted")
      setCurrentBrowserEndpoint(subscription.endpoint)
      setActionSuccess(m.settings_notifications_register_success())
    } catch (error) {
      setActionError(m.settings_notifications_register_error())
    } finally {
      setIsConnecting(false)
    }
  }

  return (
    <Surface rounded="xl" padding="lg" className="space-y-4">
      <div className="flex flex-col gap-1">
        <p className="text-sm font-medium text-foreground">
          {m.settings_notifications_title()}
        </p>
        <p className="text-sm leading-6 text-muted-foreground">
          {m.settings_notifications_description()}
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
            {m.settings_notifications_permission_label()}
          </p>
          <p className="text-sm leading-6 text-foreground">
            {getNotificationPermissionLabel(browserPermission)}
          </p>
        </div>

        <div className="flex flex-col gap-1.5">
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
            {m.settings_notifications_device_label()}
          </p>
          <p className="text-sm leading-6 text-foreground">
            {currentBrowserEndpoint
              ? m.settings_notifications_device_connected()
              : m.settings_notifications_device_not_connected()}
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <div className="flex flex-col gap-1">
          <p className="text-sm font-medium text-foreground">
            {m.settings_notifications_connection_title()}
          </p>
          <p className="text-sm leading-6 text-muted-foreground">
            {isNotificationsUnsupported
              ? m.settings_notifications_not_supported_description()
              : isPermissionDenied
                ? m.settings_notifications_permission_denied_description()
                : m.settings_notifications_connection_description()}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Button
            type="button"
            variant="secondary"
            className="rounded-2xl"
            disabled={
              isConnecting ||
              vapidPublicKeyQuery.isLoading ||
              !canEnableNotifications
            }
            onClick={() => {
              void handleEnableNotifications()
            }}
          >
            {isConnecting ? (
              <>
                <Spinner
                  label={m.settings_notifications_connecting()}
                  className="size-4"
                />
                <span>{m.settings_notifications_connecting()}</span>
              </>
            ) : currentBrowserEndpoint ? (
              m.settings_notifications_reconnect_device()
            ) : (
              m.settings_notifications_enable()
            )}
          </Button>

          <span className="text-sm leading-6 text-muted-foreground">
            {browserPermission === "granted"
              ? m.settings_notifications_permission_granted_description()
              : isNotificationsUnsupported
                ? m.settings_notifications_not_supported_description()
                : isPermissionDenied
                  ? m.settings_notifications_permission_denied_description()
                  : m.settings_notifications_permission_request_description()}
          </span>
        </div>

        {actionError ? (
          <p className="rounded-2xl border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm leading-6 text-destructive">
            {actionError}
          </p>
        ) : null}

        {actionSuccess ? (
          <p className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm leading-6 text-emerald-700 dark:text-emerald-300">
            {actionSuccess}
          </p>
        ) : null}
      </div>
    </Surface>
  )
}
