import { relations } from "drizzle-orm"
import {
  index,
  boolean,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core"

import {
  type FiqhMadhabCode,
  type FiqhNisabBenchmarkCode,
} from "@/features/fiqh-calculation"
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

export const profileRelations = relations(profile, ({ one, many }) => ({
  owner: one(user, {
    fields: [profile.ownerId],
    references: [user.id],
  }),
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
  })
)

export const wealthSnapshotEntryRelations = relations(
  wealthSnapshotEntry,
  ({ one }) => ({
    snapshot: one(wealthSnapshot, {
      fields: [wealthSnapshotEntry.snapshotId],
      references: [wealthSnapshot.id],
    }),
  })
)
