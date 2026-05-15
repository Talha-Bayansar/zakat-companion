import { relations } from "drizzle-orm"
import {
  index,
  boolean,
  integer,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core"

import {
  type FiqhMadhabCode,
  type FiqhNisabBenchmarkCode,
  fiqhCycleStateValues,
} from "@/features/fiqh-calculation"
import {
  defaultReminderCadence,
  reminderCadenceValues,
  reminderJobKindValues,
  reminderJobPhaseValues,
  reminderJobStatusValues,
} from "@/features/reminders/lib/reminders.constants"
import { user } from "../auth/schema"
import { wealthCategoryValues } from "@/features/wealth-snapshot/lib/wealth-snapshot.constants"

export * from "../auth/schema"

export const profile = pgTable(
  "profile",
  {
    id: text("id").primaryKey(),
    ownerId: text("owner_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    madhab: text("madhab").$type<FiqhMadhabCode>().notNull(),
    nisabBenchmark: text("nisab_benchmark")
      .$type<FiqhNisabBenchmarkCode>()
      .notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [index("profile_ownerId_idx").on(table.ownerId)]
)

export const profilePermission = pgTable(
  "profile_permission",
  {
    id: text("id").primaryKey(),
    profileId: text("profile_id")
      .notNull()
      .references(() => profile.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    grantedByUserId: text("granted_by_user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    permission: text("permission").notNull().default("manager"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("profile_permission_profileId_idx").on(table.profileId),
    index("profile_permission_userId_idx").on(table.userId),
    index("profile_permission_grantedByUserId_idx").on(table.grantedByUserId),
    uniqueIndex("profile_permission_profileId_userId_unique").on(
      table.profileId,
      table.userId
    ),
  ]
)

export const wealthCategory = pgEnum("wealth_category", wealthCategoryValues)
export const reminderCadence = pgEnum(
  "reminder_cadence",
  reminderCadenceValues
)
export const reminderJobKind = pgEnum(
  "reminder_job_kind",
  reminderJobKindValues
)
export const reminderJobPhase = pgEnum(
  "reminder_job_phase",
  reminderJobPhaseValues
)
export const reminderJobStatus = pgEnum(
  "reminder_job_status",
  reminderJobStatusValues
)
export const zakatCycleState = pgEnum("zakat_cycle_state", fiqhCycleStateValues)

export const reminderPreference = pgTable(
  "reminder_preference",
  {
    id: text("id").primaryKey(),
    profileId: text("profile_id")
      .notNull()
      .references(() => profile.id, { onDelete: "cascade" }),
    balanceUpdateCadence: reminderCadence("balance_update_cadence")
      .notNull()
      .default(defaultReminderCadence),
    timezone: text("timezone").notNull(),
    quietHoursStartTime: text("quiet_hours_start_time"),
    quietHoursEndTime: text("quiet_hours_end_time"),
    zakatDueFollowUpEnabled: boolean("zakat_due_follow_up_enabled")
      .notNull()
      .default(true),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    index("reminder_preference_profileId_idx").on(table.profileId),
    uniqueIndex("reminder_preference_profileId_unique").on(table.profileId),
  ]
)

export const wealthSnapshot = pgTable(
  "wealth_snapshot",
  {
    id: text("id").primaryKey(),
    profileId: text("profile_id")
      .notNull()
      .references(() => profile.id, { onDelete: "cascade" }),
    capturedAt: timestamp("captured_at").defaultNow().notNull(),
    madhab: text("madhab"),
    nisabBenchmark: text("nisab_benchmark"),
    calculationVersion: text("calculation_version"),
    netZakatableBase: text("net_zakatable_base"),
    isAboveNisab: boolean("is_above_nisab"),
    isZakatDue: boolean("is_zakat_due"),
    fiqhExplanation: text("fiqh_explanation"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    index("wealth_snapshot_profileId_idx").on(table.profileId),
    index("wealth_snapshot_profileId_capturedAt_idx").on(
      table.profileId,
      table.capturedAt
    ),
  ]
)

export const zakatCycle = pgTable(
  "zakat_cycle",
  {
    id: text("id").primaryKey(),
    profileId: text("profile_id")
      .notNull()
      .references(() => profile.id, { onDelete: "cascade" }),
    sourceSnapshotId: text("source_snapshot_id").references(
      () => wealthSnapshot.id,
      {
        onDelete: "set null",
      }
    ),
    state: zakatCycleState("state").notNull().default("open"),
    dueAt: timestamp("due_at").notNull(),
    paidAt: timestamp("paid_at"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    index("zakat_cycle_profileId_idx").on(table.profileId),
    index("zakat_cycle_state_dueAt_idx").on(table.state, table.dueAt),
    index("zakat_cycle_sourceSnapshotId_idx").on(table.sourceSnapshotId),
  ]
)

export const wealthSnapshotEntry = pgTable(
  "wealth_snapshot_entry",
  {
    id: text("id").primaryKey(),
    snapshotId: text("snapshot_id")
      .notNull()
      .references(() => wealthSnapshot.id, { onDelete: "cascade" }),
    category: wealthCategory("category").notNull(),
    amount: text("amount").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    index("wealth_snapshot_entry_snapshotId_idx").on(table.snapshotId),
    uniqueIndex("wealth_snapshot_entry_snapshotId_category_unique").on(
      table.snapshotId,
      table.category
    ),
  ]
)

export const reminderJob = pgTable(
  "reminder_job",
  {
    id: text("id").primaryKey(),
    profileId: text("profile_id")
      .notNull()
      .references(() => profile.id, { onDelete: "cascade" }),
    zakatCycleId: text("zakat_cycle_id").references(() => zakatCycle.id, {
      onDelete: "cascade",
    }),
    kind: reminderJobKind("kind").notNull(),
    phase: reminderJobPhase("phase"),
    dedupeKey: text("dedupe_key").notNull(),
    status: reminderJobStatus("status").notNull().default("pending"),
    scheduledFor: timestamp("scheduled_for").notNull(),
    attemptCount: integer("attempt_count").notNull().default(0),
    claimedAt: timestamp("claimed_at"),
    completedAt: timestamp("completed_at"),
    lastAttemptAt: timestamp("last_attempt_at"),
    lastError: text("last_error"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    index("reminder_job_profileId_idx").on(table.profileId),
    index("reminder_job_zakatCycleId_idx").on(table.zakatCycleId),
    index("reminder_job_status_scheduledFor_idx").on(
      table.status,
      table.scheduledFor
    ),
    uniqueIndex("reminder_job_dedupeKey_unique").on(table.dedupeKey),
  ]
)

export const profileRelations = relations(profile, ({ one, many }) => ({
  owner: one(user, {
    fields: [profile.ownerId],
    references: [user.id],
  }),
  reminderPreference: one(reminderPreference),
  zakatCycles: many(zakatCycle),
  reminderJobs: many(reminderJob),
  permissions: many(profilePermission),
  wealthSnapshots: many(wealthSnapshot),
}))

export const profilePermissionRelations = relations(
  profilePermission,
  ({ one }) => ({
    profile: one(profile, {
      fields: [profilePermission.profileId],
      references: [profile.id],
    }),
    user: one(user, {
      fields: [profilePermission.userId],
      references: [user.id],
    }),
    grantedBy: one(user, {
      fields: [profilePermission.grantedByUserId],
      references: [user.id],
    }),
  })
)

export const wealthSnapshotRelations = relations(
  wealthSnapshot,
  ({ one, many }) => ({
    profile: one(profile, {
      fields: [wealthSnapshot.profileId],
      references: [profile.id],
    }),
    entries: many(wealthSnapshotEntry),
    zakatCycles: many(zakatCycle),
  })
)

export const zakatCycleRelations = relations(zakatCycle, ({ one, many }) => ({
  profile: one(profile, {
    fields: [zakatCycle.profileId],
    references: [profile.id],
  }),
  sourceSnapshot: one(wealthSnapshot, {
    fields: [zakatCycle.sourceSnapshotId],
    references: [wealthSnapshot.id],
  }),
  reminderJobs: many(reminderJob),
}))

export const wealthSnapshotEntryRelations = relations(
  wealthSnapshotEntry,
  ({ one }) => ({
    snapshot: one(wealthSnapshot, {
      fields: [wealthSnapshotEntry.snapshotId],
      references: [wealthSnapshot.id],
    }),
  })
)

export const reminderPreferenceRelations = relations(
  reminderPreference,
  ({ one }) => ({
    profile: one(profile, {
      fields: [reminderPreference.profileId],
      references: [profile.id],
    }),
  })
)

export const reminderJobRelations = relations(reminderJob, ({ one }) => ({
  profile: one(profile, {
    fields: [reminderJob.profileId],
    references: [profile.id],
  }),
  zakatCycle: one(zakatCycle, {
    fields: [reminderJob.zakatCycleId],
    references: [zakatCycle.id],
  }),
}))
