import { relations } from "drizzle-orm"
import {
  index,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core"

import { user } from "../auth/schema"

export * from "../auth/schema"

export const profile = pgTable(
  "profile",
  {
    id: text("id").primaryKey(),
    ownerId: text("owner_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
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

export const profileRelations = relations(profile, ({ one, many }) => ({
  owner: one(user, {
    fields: [profile.ownerId],
    references: [user.id],
  }),
  permissions: many(profilePermission),
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
