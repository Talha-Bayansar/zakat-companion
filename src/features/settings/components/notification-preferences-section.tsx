import { useEffect, useState } from "react"

import { m } from "@/paraglide/messages"

import { useCurrentActiveProfileQuery } from "@/features/profiles"
import { Button } from "@/shared/ui/button"
import { DestructiveConfirmDialog } from "@/shared/ui/destructive-confirm-dialog"
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyTitle,
} from "@/shared/ui/empty"
import { Separator } from "@/shared/ui/separator"
import { Spinner } from "@/shared/ui/spinner"
import { Surface } from "@/shared/ui/surface"
import {
  buildBrowserPushSubscriptionRegistration,
  getBrowserNotificationPermission,
  getCurrentBrowserPushSubscription,
  unsubscribeCurrentBrowserPushSubscription,
} from "@/features/notifications/lib/notifications.client"
import {
  useRegisterNotificationSubscriptionMutation,
  useRemoveNotificationSubscriptionMutation,
} from "@/features/notifications/lib/notifications.mutations"
import type { NotificationSubscriptionRecord } from "@/features/notifications/lib/notifications.types"
import {
  useNotificationSubscriptionsQuery,
  useNotificationVapidPublicKeyQuery,
} from "@/features/notifications/lib/notifications.query"

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

function getNotificationSubscriptionStatusLabel(
  status: NotificationSubscriptionRecord["status"]
) {
  switch (status) {
    case "active":
      return m.settings_notifications_status_active()
    case "disabled":
      return m.settings_notifications_status_disabled()
    case "expired":
      return m.settings_notifications_status_expired()
    case "failed":
      return m.settings_notifications_status_failed()
  }
}

function getNotificationSubscriptionStatusTone(
  status: NotificationSubscriptionRecord["status"]
) {
  switch (status) {
    case "active":
      return "border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
    case "disabled":
      return "border-border/70 bg-muted/70 text-muted-foreground"
    case "expired":
      return "border-amber-500/20 bg-amber-500/10 text-amber-700 dark:text-amber-300"
    case "failed":
      return "border-destructive/20 bg-destructive/10 text-destructive"
  }
}

function formatNotificationSubscriptionEndpoint(endpoint: string) {
  try {
    const url = new URL(endpoint)
    return url.host
  } catch {
    return endpoint
  }
}

function formatSubscriptionCreatedAt(createdAt: Date) {
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(createdAt)
}

type NotificationSubscriptionItemProps = {
  subscription: NotificationSubscriptionRecord
  isCurrentDevice: boolean
  onRemove: (subscription: NotificationSubscriptionRecord) => Promise<void>
  isRemoving: boolean
}

function NotificationSubscriptionItem({
  subscription,
  isCurrentDevice,
  onRemove,
  isRemoving,
}: NotificationSubscriptionItemProps) {
  return (
    <article className="flex flex-col gap-4 rounded-2xl border border-border/70 bg-background/80 p-4">
      <div className="flex items-start justify-between gap-4">
        <div className="flex min-w-0 flex-col gap-1">
          <p className="truncate text-sm font-medium text-foreground">
            {formatNotificationSubscriptionEndpoint(subscription.endpoint)}
          </p>
          <p className="text-xs leading-5 text-muted-foreground">
            {m.settings_notifications_subscription_created_at({
              createdAt: formatSubscriptionCreatedAt(subscription.createdAt),
            })}
          </p>
          <p className="text-xs leading-5 text-muted-foreground">
            {isCurrentDevice
              ? m.settings_notifications_current_device()
              : m.settings_notifications_other_device()}
          </p>
        </div>

        <span
          className={`inline-flex shrink-0 items-center rounded-full border px-2.5 py-1 text-xs font-medium ${getNotificationSubscriptionStatusTone(subscription.status)}`}
        >
          {getNotificationSubscriptionStatusLabel(subscription.status)}
        </span>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border/60 pt-3">
        <p className="text-xs leading-5 text-muted-foreground">
          {m.settings_notifications_subscription_endpoint_label({
            endpoint: formatNotificationSubscriptionEndpoint(
              subscription.endpoint
            ),
          })}
        </p>

        <DestructiveConfirmDialog
          title={m.settings_notifications_unsubscribe_confirm_title()}
          description={m.settings_notifications_unsubscribe_confirm_description()}
          confirmLabel={m.settings_notifications_unsubscribe_confirm_confirm()}
          cancelLabel={m.settings_notifications_unsubscribe_confirm_cancel()}
          pendingLabel={m.settings_notifications_unsubscribing()}
          onConfirm={() => onRemove(subscription)}
          trigger={
            <Button
              type="button"
              variant="secondary"
              className="rounded-2xl"
              disabled={isRemoving}
            >
              {m.settings_notifications_unsubscribe()}
            </Button>
          }
        />
      </div>
    </article>
  )
}

export function NotificationPreferencesSection() {
  const currentActiveProfileQuery = useCurrentActiveProfileQuery()
  const activeProfile = currentActiveProfileQuery.data ?? null
  const browserSubscriptionsQuery = useNotificationSubscriptionsQuery(
    activeProfile?.canManageAccess ? activeProfile.id : null
  )
  const vapidPublicKeyQuery = useNotificationVapidPublicKeyQuery()
  const registerSubscriptionMutation =
    useRegisterNotificationSubscriptionMutation()
  const removeSubscriptionMutation = useRemoveNotificationSubscriptionMutation()
  const [browserPermission, setBrowserPermission] = useState<
    NotificationPermission | "unsupported"
  >("unsupported")
  const [currentBrowserEndpoint, setCurrentBrowserEndpoint] = useState<
    string | null
  >(null)
  const [actionError, setActionError] = useState<string | null>(null)
  const [isConnecting, setIsConnecting] = useState(false)
  const [removingSubscriptionId, setRemovingSubscriptionId] = useState<
    string | null
  >(null)

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
        {currentActiveProfileQuery.error instanceof Error &&
        currentActiveProfileQuery.error.message
          ? currentActiveProfileQuery.error.message
          : m.settings_notifications_load_error()}
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

        <Empty className="border-border/70 bg-background/80">
          <EmptyContent>
            <EmptyTitle>
              {m.settings_notifications_no_active_profile_title()}
            </EmptyTitle>
            <EmptyDescription>
              {m.settings_notifications_no_active_profile_description()}
            </EmptyDescription>
          </EmptyContent>
        </Empty>
      </Surface>
    )
  }

  if (!activeProfile.canManageAccess) {
    return null
  }

  if (browserSubscriptionsQuery.isLoading) {
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

  if (browserSubscriptionsQuery.isError) {
    return (
      <p className="rounded-[1.75rem] border border-destructive/20 bg-destructive/5 px-5 py-4 text-sm leading-6 text-destructive">
        {browserSubscriptionsQuery.error instanceof Error &&
        browserSubscriptionsQuery.error.message
          ? browserSubscriptionsQuery.error.message
          : m.settings_notifications_load_error()}
      </p>
    )
  }

  const subscriptions = browserSubscriptionsQuery.data ?? []
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
    } catch (error) {
      setActionError(
        error instanceof Error && error.message
          ? error.message
          : m.settings_notifications_register_error()
      )
    } finally {
      setIsConnecting(false)
    }
  }

  async function handleRemoveSubscription(
    subscription: NotificationSubscriptionRecord
  ) {
    setActionError(null)
    setRemovingSubscriptionId(subscription.id)

    try {
      if (subscription.endpoint === currentBrowserEndpoint) {
        await unsubscribeCurrentBrowserPushSubscription()
        setCurrentBrowserEndpoint(null)
      }

      await removeSubscriptionMutation.mutateAsync({
        subscriptionId: subscription.id,
      })
    } catch (error) {
      setActionError(
        error instanceof Error && error.message
          ? error.message
          : m.settings_notifications_remove_error()
      )
    } finally {
      setRemovingSubscriptionId(null)
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
        <div className="flex flex-col gap-2 rounded-2xl border border-border/70 bg-background/80 p-4">
          <p className="text-xs font-medium tracking-[0.18em] text-muted-foreground uppercase">
            {m.settings_notifications_permission_label()}
          </p>
          <p className="text-sm leading-6 text-foreground">
            {getNotificationPermissionLabel(browserPermission)}
          </p>
        </div>

        <div className="flex flex-col gap-2 rounded-2xl border border-border/70 bg-background/80 p-4">
          <p className="text-xs font-medium tracking-[0.18em] text-muted-foreground uppercase">
            {m.settings_notifications_device_label()}
          </p>
          <p className="text-sm leading-6 text-foreground">
            {currentBrowserEndpoint
              ? m.settings_notifications_device_connected()
              : m.settings_notifications_device_not_connected()}
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-3 rounded-2xl border border-border/70 bg-background/80 p-4">
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
      </div>

      <Separator />

      {subscriptions.length > 0 ? (
        <div className="space-y-3">
          {subscriptions.map((subscription) => (
            <NotificationSubscriptionItem
              key={subscription.id}
              subscription={subscription}
              isCurrentDevice={subscription.endpoint === currentBrowserEndpoint}
              onRemove={handleRemoveSubscription}
              isRemoving={removingSubscriptionId === subscription.id}
            />
          ))}
        </div>
      ) : (
        <Empty className="border-border/70 bg-background/80">
          <EmptyContent>
            <EmptyTitle>{m.settings_notifications_empty_title()}</EmptyTitle>
            <EmptyDescription>
              {m.settings_notifications_empty_description()}
            </EmptyDescription>
          </EmptyContent>
        </Empty>
      )}
    </Surface>
  )
}
