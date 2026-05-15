import { z } from "zod"

import {
  defaultReminderCadence,
  reminderQuietHourTimePattern,
  reminderCadenceValues,
  reminderJobKindValues,
  reminderJobPhaseValues,
  reminderJobStatusValues,
} from "./reminders.constants"
import { fiqhCycleStateValues } from "@/features/fiqh-calculation"

export const reminderCadenceSchema = z.enum(reminderCadenceValues)

export const reminderQuietHoursSchema = z
  .object({
    startTime: z.string().trim().regex(reminderQuietHourTimePattern),
    endTime: z.string().trim().regex(reminderQuietHourTimePattern),
  })

export const reminderPreferenceSchema = z.object({
  balanceUpdateCadence: reminderCadenceSchema.default(defaultReminderCadence),
  timezone: z.string().trim().min(1),
  quietHours: reminderQuietHoursSchema.nullable(),
  zakatDueFollowUpEnabled: z.boolean(),
})

const reminderJobBaseSchema = z.object({
  id: z.string().trim().min(1),
  profileId: z.string().trim().min(1),
  dedupeKey: z.string().trim().min(1),
  scheduledFor: z.date(),
  status: z.enum(reminderJobStatusValues),
  attemptCount: z.number().int().nonnegative(),
  claimedAt: z.date().nullable(),
  completedAt: z.date().nullable(),
  lastAttemptAt: z.date().nullable(),
  lastError: z.string().trim().min(1).nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
})

export const balanceUpdateReminderJobSchema = reminderJobBaseSchema.extend({
  kind: z.literal("balance_update"),
  phase: z.null(),
})

export const zakatDueReminderJobSchema = reminderJobBaseSchema.extend({
  kind: z.literal("zakat_due"),
  zakatCycleId: z.string().trim().min(1),
  phase: z.enum(reminderJobPhaseValues),
})

export const reminderJobSchema = z.discriminatedUnion("kind", [
  balanceUpdateReminderJobSchema,
  zakatDueReminderJobSchema,
])

export const reminderJobKindSchema = z.enum(reminderJobKindValues)

export const reminderJobPhaseSchema = z.enum(reminderJobPhaseValues)

export const zakatCycleSchema = z.object({
  id: z.string().trim().min(1),
  profileId: z.string().trim().min(1),
  sourceSnapshotId: z.string().trim().min(1).nullable(),
  state: z.enum(fiqhCycleStateValues),
  dueAt: z.date(),
  paidAt: z.date().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
})
