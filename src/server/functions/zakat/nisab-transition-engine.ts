import { and, desc, eq, ne } from 'drizzle-orm'
import { db } from '@/server/db'
import { zakatAssessments, zakatCycles, zakatEvents } from '@/server/db/schema'

const LUNAR_YEAR_DAYS = 354

type NisabState = 'ABOVE' | 'BELOW'

type TransitionResult = {
  previousState: NisabState | null
  currentState: NisabState
  transition: 'NONE' | 'BELOW_TO_ABOVE' | 'ABOVE_TO_BELOW'
  activeCycleId: string | null
  nextDueAt: Date | null
}

const addLunarYear = (date: Date) => {
  const next = new Date(date)
  next.setUTCDate(next.getUTCDate() + LUNAR_YEAR_DAYS)
  return next
}

const toErrorLog = (error: unknown) => {
  if (error instanceof Error) {
    return {
      name: error.name,
      message: error.message,
      stack: error.stack,
    }
  }

  return { value: String(error) }
}

export const processNisabTransition = async (params: {
  userId: string
  assessmentId: string
  assessmentAt: Date
  nisabState: NisabState
}) => {
  const { userId, assessmentId, assessmentAt, nisabState } = params
  let step = 'load-current-state'

  try {
    const [previousAssessment, activeCycle] = await Promise.all([
      db.query.zakatAssessments.findFirst({
        where: and(eq(zakatAssessments.userId, userId), ne(zakatAssessments.id, assessmentId)),
        orderBy: [desc(zakatAssessments.assessmentAt), desc(zakatAssessments.createdAt)],
      }),
      db.query.zakatCycles.findFirst({
        where: and(eq(zakatCycles.userId, userId), eq(zakatCycles.status, 'running')),
        orderBy: [desc(zakatCycles.startedAt)],
      }),
    ])

    const previousState = previousAssessment?.nisabState ?? null

    const transition: TransitionResult['transition'] =
      previousState === 'BELOW' && nisabState === 'ABOVE'
        ? 'BELOW_TO_ABOVE'
        : previousState === 'ABOVE' && nisabState === 'BELOW'
          ? 'ABOVE_TO_BELOW'
          : 'NONE'

    step = 'insert-state-event'
    await db.insert(zakatEvents).values({
      userId,
      cycleId: activeCycle?.id ?? null,
      eventType: nisabState === 'ABOVE' ? 'state_above' : 'state_below',
      eventAt: assessmentAt,
      metaJson: {
        assessmentId,
        previousState,
        currentState: nisabState,
      },
    })

    const shouldStartCycle = nisabState === 'ABOVE' && !activeCycle && (transition === 'BELOW_TO_ABOVE' || previousState === null)

    if (shouldStartCycle) {
      step = 'insert-cycle-start'
      const [newCycle] = await db
        .insert(zakatCycles)
        .values({
          userId,
          startedAt: assessmentAt,
          status: 'running',
          ruleProfile: 'standard-reset',
          nextDueAt: addLunarYear(assessmentAt),
        })
        .returning({ id: zakatCycles.id, nextDueAt: zakatCycles.nextDueAt })

      step = 'insert-cycle-start-event'
      await db.insert(zakatEvents).values({
        userId,
        cycleId: newCycle.id,
        eventType: 'cycle_start',
        eventAt: assessmentAt,
        metaJson: {
          assessmentId,
          reason: transition === 'BELOW_TO_ABOVE' ? 'below_to_above' : 'initial_above',
          projectedDueAt: newCycle.nextDueAt,
        },
      })

      return {
        previousState,
        currentState: nisabState,
        transition,
        activeCycleId: newCycle.id,
        nextDueAt: newCycle.nextDueAt,
      } satisfies TransitionResult
    }

    if (transition === 'ABOVE_TO_BELOW' && activeCycle) {
      step = 'update-cycle-end'
      await db
        .update(zakatCycles)
        .set({
          status: 'ended',
          endedAt: assessmentAt,
          endReason: 'fell_below_nisab',
          updatedAt: new Date(),
          nextDueAt: null,
        })
        .where(eq(zakatCycles.id, activeCycle.id))

      step = 'insert-cycle-end-event'
      await db.insert(zakatEvents).values({
        userId,
        cycleId: activeCycle.id,
        eventType: 'cycle_end',
        eventAt: assessmentAt,
        metaJson: {
          assessmentId,
          reason: 'fell_below_nisab',
          mode: 'standard-reset',
        },
      })

      return {
        previousState,
        currentState: nisabState,
        transition,
        activeCycleId: null,
        nextDueAt: null,
      } satisfies TransitionResult
    }

    return {
      previousState,
      currentState: nisabState,
      transition,
      activeCycleId: activeCycle?.id ?? null,
      nextDueAt: activeCycle?.nextDueAt ?? null,
    } satisfies TransitionResult
  } catch (error) {
    console.error('[processNisabTransition] failed', {
      userId,
      assessmentId,
      nisabState,
      step,
      error: toErrorLog(error),
    })

    throw error
  }
}
