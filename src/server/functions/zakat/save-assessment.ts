import { createServerFn } from '@tanstack/react-start'
import Decimal from 'decimal.js'
import { and, eq } from 'drizzle-orm'
import { z } from 'zod'
import { db } from '@/server/db'
import { financialProfiles, users, zakatAssessments } from '@/server/db/schema'
import { processNisabTransition } from './nisab-transition-engine'

const saveAssessmentSchema = z.object({
  userId: z.string().min(1),
  assessmentAt: z.coerce.date().optional(),
  values: z.object({
    cash: z.string(),
    gold: z.string(),
    silver: z.string(),
    investments: z.string(),
    businessAssets: z.string(),
    receivables: z.string(),
    debtsDue: z.string(),
    otherLiabilities: z.string(),
    nisab: z.string(),
  }),
})

const toMoneyDecimal = (value: string) => {
  if (!value.trim()) return new Decimal(0)

  try {
    const normalized = value.replaceAll(',', '.').trim()
    const amount = new Decimal(normalized)
    return amount.isNegative() ? new Decimal(0) : amount
  } catch {
    return new Decimal(0)
  }
}

const toDbAmount = (value: Decimal) => value.toFixed(2)

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

export const saveAssessment = createServerFn({ method: 'POST' })
  .inputValidator(saveAssessmentSchema)
  .handler(async ({ data }) => {
    const assessmentAt = data.assessmentAt ?? new Date()
    let step = 'init'

    try {
      console.info('[saveAssessment] start', {
        userId: data.userId,
        assessmentAt: assessmentAt.toISOString(),
      })

      step = 'ensure-user'
      await db
        .insert(users)
        .values({
          id: data.userId,
          name: 'Guest User',
          email: `${data.userId}@local.zakat-companion`,
          emailVerified: false,
        })
        .onConflictDoNothing({ target: users.id })

      const cash = toMoneyDecimal(data.values.cash)
      const gold = toMoneyDecimal(data.values.gold)
      const silver = toMoneyDecimal(data.values.silver)
      const investments = toMoneyDecimal(data.values.investments)
      const businessAssets = toMoneyDecimal(data.values.businessAssets)
      const receivables = toMoneyDecimal(data.values.receivables)

      const debtsDue = toMoneyDecimal(data.values.debtsDue)
      const otherLiabilities = toMoneyDecimal(data.values.otherLiabilities)
      const nisab = toMoneyDecimal(data.values.nisab)

      const totalAssets = cash.plus(gold).plus(silver).plus(investments).plus(businessAssets).plus(receivables)
      const totalLiabilities = debtsDue.plus(otherLiabilities)
      const netZakatableWealth = Decimal.max(totalAssets.minus(totalLiabilities), 0)
      const isAboveNisab = netZakatableWealth.greaterThanOrEqualTo(nisab) && nisab.greaterThan(0)
      const zakatDueNow = isAboveNisab ? netZakatableWealth.mul(0.025) : new Decimal(0)
      const nisabState = isAboveNisab ? 'ABOVE' : 'BELOW'

      step = 'insert-assessment'
      const [savedAssessment] = await db
        .insert(zakatAssessments)
        .values({
          userId: data.userId,
          assessmentAt,
          cash: toDbAmount(cash),
          gold: toDbAmount(gold),
          silver: toDbAmount(silver),
          investments: toDbAmount(investments),
          businessAssets: toDbAmount(businessAssets),
          receivables: toDbAmount(receivables),
          debtsDue: toDbAmount(debtsDue),
          otherLiabilities: toDbAmount(otherLiabilities),
          totalAssets: toDbAmount(totalAssets),
          totalLiabilities: toDbAmount(totalLiabilities),
          netZakatableWealth: toDbAmount(netZakatableWealth),
          nisabValue: toDbAmount(nisab),
          zakatDueNow: toDbAmount(zakatDueNow),
          nisabState,
          amountDue: toDbAmount(zakatDueNow),
          aboveNisab: isAboveNisab,
        })
        .returning({
          id: zakatAssessments.id,
          assessmentAt: zakatAssessments.assessmentAt,
        })

      step = 'process-transition'
      const transition = await processNisabTransition({
        userId: data.userId,
        assessmentId: savedAssessment.id,
        assessmentAt: savedAssessment.assessmentAt,
        nisabState,
      })

      step = 'upsert-financial-profile'
      await db
        .insert(financialProfiles)
        .values({
          userId: data.userId,
          cash: toDbAmount(cash),
          gold: toDbAmount(gold),
          silver: toDbAmount(silver),
          investments: toDbAmount(investments),
          businessAssets: toDbAmount(businessAssets),
          receivables: toDbAmount(receivables),
          debtsDue: toDbAmount(debtsDue),
          otherLiabilities: toDbAmount(otherLiabilities),
          nisabValue: toDbAmount(nisab),
          updatedAt: new Date(),
        })
        .onConflictDoUpdate({
          target: financialProfiles.userId,
          set: {
            cash: toDbAmount(cash),
            gold: toDbAmount(gold),
            silver: toDbAmount(silver),
            investments: toDbAmount(investments),
            businessAssets: toDbAmount(businessAssets),
            receivables: toDbAmount(receivables),
            debtsDue: toDbAmount(debtsDue),
            otherLiabilities: toDbAmount(otherLiabilities),
            nisabValue: toDbAmount(nisab),
            updatedAt: new Date(),
          },
        })

      step = 'select-latest-assessment'
      const [latestAssessment] = await db
        .select({
          id: zakatAssessments.id,
          assessmentAt: zakatAssessments.assessmentAt,
          netZakatableWealth: zakatAssessments.netZakatableWealth,
          nisabValue: zakatAssessments.nisabValue,
          zakatDueNow: zakatAssessments.zakatDueNow,
          nisabState: zakatAssessments.nisabState,
        })
        .from(zakatAssessments)
        .where(and(eq(zakatAssessments.userId, data.userId), eq(zakatAssessments.id, savedAssessment.id)))

      console.info('[saveAssessment] success', {
        userId: data.userId,
        assessmentId: savedAssessment.id,
        transition: transition.transition,
      })

      return {
        assessment: latestAssessment,
        transition,
      }
    } catch (error) {
      console.error('[saveAssessment] failed', {
        userId: data.userId,
        step,
        error: toErrorLog(error),
      })
      throw error
    }
  })
