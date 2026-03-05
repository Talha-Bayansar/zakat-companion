import { and, desc, eq, inArray } from 'drizzle-orm'
import { db } from '@/server/db'
import { zakatAssessments, zakatCycles, zakatEvents } from '@/server/db/schema'

type ReminderKind = 'checkin_monthly' | 'due_30d' | 'due_7d' | 'due_1d' | 'due_today'

type PlannedReminder = {
  userId: string
  cycleId: string | null
  kind: ReminderKind
  targetDate: string
  idempotencyKey: string
  deepLink: string
  context: Record<string, unknown>
}

export type ReminderPlannerResult = {
  dryRun: boolean
  now: string
  scannedUsers: number
  planned: number
  skippedAlreadyPlanned: number
  reminders: PlannedReminder[]
}

const ONE_DAY_MS = 24 * 60 * 60 * 1000

const startOfUtcDay = (date: Date) => new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()))
const isoDay = (date: Date) => date.toISOString().slice(0, 10)

const diffInDays = (from: Date, to: Date) => Math.round((startOfUtcDay(to).getTime() - startOfUtcDay(from).getTime()) / ONE_DAY_MS)

function makeKey(params: { userId: string; cycleId: string | null; kind: ReminderKind; targetDate: string }) {
  return [params.userId, params.cycleId ?? 'no-cycle', params.kind, params.targetDate].join(':')
}

function buildCycleReminder(params: {
  userId: string
  cycleId: string
  kind: ReminderKind
  dueDate: Date
  nowDay: Date
}): PlannedReminder {
  const targetDate = isoDay(params.nowDay)

  return {
    userId: params.userId,
    cycleId: params.cycleId,
    kind: params.kind,
    targetDate,
    idempotencyKey: makeKey({ userId: params.userId, cycleId: params.cycleId, kind: params.kind, targetDate }),
    deepLink: '/dashboard/history',
    context: {
      dueDate: params.dueDate.toISOString(),
      dayDelta: diffInDays(params.nowDay, params.dueDate),
    },
  }
}

function buildCheckinReminder(params: { userId: string; nowDay: Date; lastAssessmentAt: Date }) {
  const kind: ReminderKind = 'checkin_monthly'
  const targetDate = isoDay(params.nowDay)

  return {
    userId: params.userId,
    cycleId: null,
    kind,
    targetDate,
    idempotencyKey: makeKey({ userId: params.userId, cycleId: null, kind, targetDate }),
    deepLink: '/dashboard/calculator',
    context: {
      lastAssessmentAt: params.lastAssessmentAt.toISOString(),
      daysSinceAssessment: diffInDays(params.lastAssessmentAt, params.nowDay),
    },
  } satisfies PlannedReminder
}

export async function runReminderPlanner(input?: {
  dryRun?: boolean
  now?: Date
  limitUsers?: number
}): Promise<ReminderPlannerResult> {
  const dryRun = input?.dryRun ?? true
  const now = input?.now ?? new Date()
  const nowDay = startOfUtcDay(now)

  const runningCycles = await db.query.zakatCycles.findMany({
    where: eq(zakatCycles.status, 'running'),
    orderBy: [desc(zakatCycles.startedAt)],
    limit: input?.limitUsers,
  })

  const cycleUserIds = [...new Set(runningCycles.map((c) => c.userId))]

  const latestAssessments = cycleUserIds.length
    ? await db
        .select({
          userId: zakatAssessments.userId,
          assessmentAt: zakatAssessments.assessmentAt,
        })
        .from(zakatAssessments)
        .where(inArray(zakatAssessments.userId, cycleUserIds))
        .orderBy(desc(zakatAssessments.assessmentAt))
    : []

  const latestAssessmentByUser = new Map<string, Date>()
  for (const row of latestAssessments) {
    if (!latestAssessmentByUser.has(row.userId)) {
      latestAssessmentByUser.set(row.userId, row.assessmentAt)
    }
  }

  const reminders: PlannedReminder[] = []

  for (const cycle of runningCycles) {
    if (!cycle.nextDueAt) continue

    const daysUntilDue = diffInDays(nowDay, cycle.nextDueAt)

    if (daysUntilDue === 30) {
      reminders.push(
        buildCycleReminder({
          userId: cycle.userId,
          cycleId: cycle.id,
          kind: 'due_30d',
          dueDate: cycle.nextDueAt,
          nowDay,
        }),
      )
    }

    if (daysUntilDue === 7) {
      reminders.push(
        buildCycleReminder({
          userId: cycle.userId,
          cycleId: cycle.id,
          kind: 'due_7d',
          dueDate: cycle.nextDueAt,
          nowDay,
        }),
      )
    }

    if (daysUntilDue === 1) {
      reminders.push(
        buildCycleReminder({
          userId: cycle.userId,
          cycleId: cycle.id,
          kind: 'due_1d',
          dueDate: cycle.nextDueAt,
          nowDay,
        }),
      )
    }

    if (daysUntilDue === 0) {
      reminders.push(
        buildCycleReminder({
          userId: cycle.userId,
          cycleId: cycle.id,
          kind: 'due_today',
          dueDate: cycle.nextDueAt,
          nowDay,
        }),
      )
    }
  }

  for (const userId of cycleUserIds) {
    const lastAssessmentAt = latestAssessmentByUser.get(userId)
    if (!lastAssessmentAt) continue

    const daysSince = diffInDays(lastAssessmentAt, nowDay)
    if (daysSince >= 30) {
      reminders.push(
        buildCheckinReminder({
          userId,
          nowDay,
          lastAssessmentAt,
        }),
      )
    }
  }

  const cycleIds = [...new Set(reminders.map((r) => r.cycleId).filter(Boolean) as string[])]
  const existingEvents = cycleIds.length
    ? await db.query.zakatEvents.findMany({
        where: and(eq(zakatEvents.eventType, 'due_reminder_sent'), inArray(zakatEvents.cycleId, cycleIds)),
      })
    : []

  const existingKeys = new Set<string>()
  for (const event of existingEvents) {
    const key = (event.metaJson as Record<string, unknown>)?.idempotencyKey
    if (typeof key === 'string') existingKeys.add(key)
  }

  const remindersWithoutCycle = reminders.filter((r) => !r.cycleId)
  if (remindersWithoutCycle.length) {
    const userIds = [...new Set(remindersWithoutCycle.map((r) => r.userId))]
    const existingNoCycle = await db.query.zakatEvents.findMany({
      where: and(eq(zakatEvents.eventType, 'due_reminder_sent'), inArray(zakatEvents.userId, userIds)),
    })

    for (const event of existingNoCycle) {
      const key = (event.metaJson as Record<string, unknown>)?.idempotencyKey
      if (typeof key === 'string') existingKeys.add(key)
    }
  }

  const deduped = reminders.filter((r) => !existingKeys.has(r.idempotencyKey))
  const skippedAlreadyPlanned = reminders.length - deduped.length

  if (!dryRun && deduped.length) {
    await db.insert(zakatEvents).values(
      deduped.map((r) => ({
        userId: r.userId,
        cycleId: r.cycleId,
        eventType: 'due_reminder_sent' as const,
        eventAt: now,
        metaJson: {
          idempotencyKey: r.idempotencyKey,
          reminderKind: r.kind,
          targetDate: r.targetDate,
          deepLink: r.deepLink,
          context: r.context,
          deliveryStatus: 'planned',
        },
      })),
    )
  }

  return {
    dryRun,
    now: now.toISOString(),
    scannedUsers: cycleUserIds.length,
    planned: deduped.length,
    skippedAlreadyPlanned,
    reminders: deduped,
  }
}
