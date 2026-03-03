import { boolean, index, numeric, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core'
import { users } from './auth'
import { nisabStateEnum } from './zakat-lifecycle'

export const zakatAssessments = pgTable(
  'zakat_assessments',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    assessmentAt: timestamp('assessment_at', { withTimezone: true }).notNull().defaultNow(),

    // input snapshot
    cash: numeric('cash', { precision: 14, scale: 2 }).notNull().default('0'),
    gold: numeric('gold', { precision: 14, scale: 2 }).notNull().default('0'),
    silver: numeric('silver', { precision: 14, scale: 2 }).notNull().default('0'),
    investments: numeric('investments', { precision: 14, scale: 2 }).notNull().default('0'),
    businessAssets: numeric('business_assets', { precision: 14, scale: 2 }).notNull().default('0'),
    receivables: numeric('receivables', { precision: 14, scale: 2 }).notNull().default('0'),
    debtsDue: numeric('debts_due', { precision: 14, scale: 2 }).notNull().default('0'),
    otherLiabilities: numeric('other_liabilities', { precision: 14, scale: 2 }).notNull().default('0'),

    // computed outputs
    totalAssets: numeric('total_assets', { precision: 14, scale: 2 }).notNull().default('0'),
    totalLiabilities: numeric('total_liabilities', { precision: 14, scale: 2 }).notNull().default('0'),
    netZakatableWealth: numeric('net_zakatable_wealth', { precision: 14, scale: 2 }).notNull().default('0'),
    nisabValue: numeric('nisab_value', { precision: 14, scale: 2 }).notNull().default('0'),
    zakatDueNow: numeric('zakat_due_now', { precision: 14, scale: 2 }).notNull().default('0'),
    nisabState: nisabStateEnum('nisab_state').notNull(),

    // legacy fields kept for backwards compatibility during migration
    amountDue: numeric('amount_due', { precision: 12, scale: 2 }).notNull().default('0'),
    aboveNisab: boolean('above_nisab').notNull().default(false),
    calculatedAt: timestamp('calculated_at', { withTimezone: true }).notNull().defaultNow(),

    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index('zakat_assessments_user_assessment_idx').on(table.userId, table.assessmentAt)],
)
