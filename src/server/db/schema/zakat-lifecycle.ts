import { index, jsonb, numeric, pgEnum, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core'
import { users } from './auth'

export const nisabStateEnum = pgEnum('nisab_state', ['ABOVE', 'BELOW'])
export const cycleStatusEnum = pgEnum('zakat_cycle_status', ['running', 'ended'])
export const cycleEndReasonEnum = pgEnum('zakat_cycle_end_reason', ['fell_below_nisab', 'paid', 'manual', 'rule_change'])
export const zakatEventTypeEnum = pgEnum('zakat_event_type', [
  'state_above',
  'state_below',
  'cycle_start',
  'cycle_end',
  'due_reminder_sent',
  'due_notified',
])

export const financialProfiles = pgTable(
  'financial_profiles',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' })
      .unique(),
    currency: text('currency').notNull().default('EUR'),
    method: text('method').notNull().default('standard'),
    cash: numeric('cash', { precision: 14, scale: 2 }).notNull().default('0'),
    gold: numeric('gold', { precision: 14, scale: 2 }).notNull().default('0'),
    silver: numeric('silver', { precision: 14, scale: 2 }).notNull().default('0'),
    investments: numeric('investments', { precision: 14, scale: 2 }).notNull().default('0'),
    businessAssets: numeric('business_assets', { precision: 14, scale: 2 }).notNull().default('0'),
    receivables: numeric('receivables', { precision: 14, scale: 2 }).notNull().default('0'),
    debtsDue: numeric('debts_due', { precision: 14, scale: 2 }).notNull().default('0'),
    otherLiabilities: numeric('other_liabilities', { precision: 14, scale: 2 }).notNull().default('0'),
    nisabValue: numeric('nisab_value', { precision: 14, scale: 2 }).notNull().default('0'),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index('financial_profiles_user_updated_idx').on(table.userId, table.updatedAt)],
)

export const zakatCycles = pgTable(
  'zakat_cycles',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    startedAt: timestamp('started_at', { withTimezone: true }).notNull(),
    endedAt: timestamp('ended_at', { withTimezone: true }),
    status: cycleStatusEnum('status').notNull().default('running'),
    endReason: cycleEndReasonEnum('end_reason'),
    ruleProfile: text('rule_profile').notNull().default('standard-reset'),
    nextDueAt: timestamp('next_due_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index('zakat_cycles_user_status_idx').on(table.userId, table.status),
    index('zakat_cycles_user_started_idx').on(table.userId, table.startedAt),
  ],
)

export const pushSubscriptions = pgTable(
  'push_subscriptions',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    endpoint: text('endpoint').notNull(),
    p256dh: text('p256dh').notNull(),
    auth: text('auth').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index('push_subscriptions_user_idx').on(table.userId),
    index('push_subscriptions_endpoint_idx').on(table.endpoint),
  ],
)

export const zakatEvents = pgTable(
  'zakat_events',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    cycleId: uuid('cycle_id').references(() => zakatCycles.id, { onDelete: 'set null' }),
    eventType: zakatEventTypeEnum('event_type').notNull(),
    eventAt: timestamp('event_at', { withTimezone: true }).notNull().defaultNow(),
    metaJson: jsonb('meta_json').notNull().default({}),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index('zakat_events_user_event_at_idx').on(table.userId, table.eventAt),
    index('zakat_events_cycle_event_at_idx').on(table.cycleId, table.eventAt),
  ],
)
