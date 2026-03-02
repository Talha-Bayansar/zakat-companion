import { boolean, numeric, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core'
import { users } from './auth'

export const zakatAssessments = pgTable('zakat_assessments', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: text('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  amountDue: numeric('amount_due', { precision: 12, scale: 2 }).notNull(),
  aboveNisab: boolean('above_nisab').notNull(),
  calculatedAt: timestamp('calculated_at', { withTimezone: true }).notNull().defaultNow()
})
