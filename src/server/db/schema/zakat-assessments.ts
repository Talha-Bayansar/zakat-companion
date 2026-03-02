import { boolean, pgTable, timestamp, uuid, numeric } from 'drizzle-orm/pg-core'

export const zakatAssessments = pgTable('zakat_assessments', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull(),
  amountDue: numeric('amount_due', { precision: 12, scale: 2 }).notNull(),
  aboveNisab: boolean('above_nisab').notNull(),
  calculatedAt: timestamp('calculated_at', { withTimezone: true }).notNull().defaultNow()
})
