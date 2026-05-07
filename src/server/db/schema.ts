import { integer, pgTable, timestamp, varchar } from "drizzle-orm/pg-core"

export const profilesTable = pgTable("profiles", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  displayName: varchar({ length: 255 }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
})

export type Profile = typeof profilesTable.$inferSelect
export type NewProfile = typeof profilesTable.$inferInsert
