import { and, desc, eq, inArray } from 'drizzle-orm'
import { db } from '@/server/db'
import { pushSubscriptions, zakatEvents } from '@/server/db/schema'
import { sendWebPushReminder } from '@/server/functions/reminders/send-web-push-reminder'

type ReminderMeta = {
  idempotencyKey?: string
  reminderKind?: string
  targetDate?: string
  deepLink?: string
  context?: Record<string, unknown>
  deliveryStatus?: 'planned' | 'processing' | 'sent' | 'failed_transient' | 'failed_permanent'
  retryCount?: number
  lastAttemptAt?: string
  nextRetryAt?: string
  deliveryProvider?: string
  deliveryError?: string
}

type DeliveryResult = {
  ok: boolean
  transient: boolean
  provider: string
  error?: string
}

export type ReminderDeliverySummary = {
  dryRun: boolean
  now: string
  scanned: number
  sent: number
  skipped: number
  failedTransient: number
  failedPermanent: number
}

const MAX_RETRIES = 3

function todayIso(date: Date) {
  return date.toISOString().slice(0, 10)
}

function isDue(meta: ReminderMeta, now: Date) {
  if (!meta.targetDate) return false
  return meta.targetDate <= todayIso(now)
}

function shouldRetry(meta: ReminderMeta, now: Date) {
  if (meta.deliveryStatus !== 'failed_transient') return false
  const retryCount = meta.retryCount ?? 0
  if (retryCount >= MAX_RETRIES) return false
  if (!meta.nextRetryAt) return true
  return new Date(meta.nextRetryAt).getTime() <= now.getTime()
}

function nextRetryAt(now: Date, retryCount: number) {
  const backoffMinutes = Math.min(60, Math.pow(2, retryCount) * 5)
  return new Date(now.getTime() + backoffMinutes * 60_000).toISOString()
}

async function deliverReminder(input: {
  userId: string
  meta: ReminderMeta
}): Promise<DeliveryResult> {
  const subscriptions = await db.query.pushSubscriptions.findMany({
    where: eq(pushSubscriptions.userId, input.userId),
  })

  const result = await sendWebPushReminder({
    subscriptions,
    reminderKind: input.meta.reminderKind,
    deepLink: input.meta.deepLink,
  })

  if (result.invalidEndpoints?.length) {
    await db
      .delete(pushSubscriptions)
      .where(
        and(
          eq(pushSubscriptions.userId, input.userId),
          inArray(pushSubscriptions.endpoint, result.invalidEndpoints),
        ),
      )
  }

  return result
}

export async function executeReminderDelivery(input?: {
  dryRun?: boolean
  now?: Date
  limit?: number
}): Promise<ReminderDeliverySummary> {
  const dryRun = input?.dryRun ?? true
  const now = input?.now ?? new Date()
  const limit = input?.limit ?? 200

  const recent = await db.query.zakatEvents.findMany({
    where: eq(zakatEvents.eventType, 'due_reminder_sent'),
    orderBy: [desc(zakatEvents.createdAt)],
    limit,
  })

  const candidates = recent.filter((event) => {
    const meta = (event.metaJson ?? {}) as ReminderMeta
    return (meta.deliveryStatus === 'planned' && isDue(meta, now)) || shouldRetry(meta, now)
  })

  let sent = 0
  let skipped = 0
  let failedTransient = 0
  let failedPermanent = 0

  for (const event of candidates) {
    const meta = (event.metaJson ?? {}) as ReminderMeta
    const idempotencyKey = meta.idempotencyKey

    if (!idempotencyKey) {
      skipped += 1
      continue
    }

    const notifiedEvents = await db.query.zakatEvents.findMany({
      where: and(eq(zakatEvents.eventType, 'due_notified'), eq(zakatEvents.userId, event.userId)),
      orderBy: [desc(zakatEvents.createdAt)],
      limit: 200,
    })

    const alreadyNotified = notifiedEvents.some(
      (row) => ((row.metaJson as ReminderMeta | undefined)?.idempotencyKey ?? null) === idempotencyKey,
    )

    if (alreadyNotified) {
      skipped += 1
      continue
    }

    if (dryRun) {
      sent += 1
      continue
    }

    const retryCount = meta.retryCount ?? 0

    const result = await deliverReminder({ userId: event.userId, meta })
    const baseMeta: ReminderMeta = {
      ...meta,
      lastAttemptAt: now.toISOString(),
      deliveryProvider: result.provider,
      retryCount,
    }

    if (result.ok) {
      await db
        .update(zakatEvents)
        .set({
          metaJson: {
            ...baseMeta,
            deliveryStatus: 'sent',
            deliveryError: null,
          },
        })
        .where(eq(zakatEvents.id, event.id))

      await db.insert(zakatEvents).values({
        userId: event.userId,
        cycleId: event.cycleId,
        eventType: 'due_notified',
        eventAt: now,
        metaJson: {
          idempotencyKey,
          reminderKind: meta.reminderKind,
          targetDate: meta.targetDate,
          deepLink: meta.deepLink,
        },
      })

      sent += 1
      continue
    }

    if (result.transient && retryCount + 1 < MAX_RETRIES) {
      await db
        .update(zakatEvents)
        .set({
          metaJson: {
            ...baseMeta,
            deliveryStatus: 'failed_transient',
            retryCount: retryCount + 1,
            nextRetryAt: nextRetryAt(now, retryCount + 1),
            deliveryError: result.error ?? 'transient_error',
          },
        })
        .where(eq(zakatEvents.id, event.id))

      failedTransient += 1
      continue
    }

    await db
      .update(zakatEvents)
      .set({
        metaJson: {
          ...baseMeta,
          deliveryStatus: 'failed_permanent',
          retryCount: retryCount + 1,
          nextRetryAt: null,
          deliveryError: result.error ?? 'permanent_error',
        },
      })
      .where(eq(zakatEvents.id, event.id))

    failedPermanent += 1
  }

  return {
    dryRun,
    now: now.toISOString(),
    scanned: candidates.length,
    sent,
    skipped,
    failedTransient,
    failedPermanent,
  }
}
