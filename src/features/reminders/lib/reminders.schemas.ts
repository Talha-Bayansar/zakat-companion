import { z } from "zod"

import { m } from "@/paraglide/messages"
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

function isValidIanaTimezone(timezone: string) {
  try {
    new Intl.DateTimeFormat("en-US", { timeZone: timezone })
    return true
  } catch {
    return false
  }
}

export const reminderQuietHoursSchema = z
  .object({
    startTime: z.string().trim().regex(reminderQuietHourTimePattern),
    endTime: z.string().trim().regex(reminderQuietHourTimePattern),
  })

export const reminderPreferenceSchema = z.object({
  balanceUpdateCadence: reminderCadenceSchema.default(defaultReminderCadence),
  timezone: z
    .string()
    .trim()
    .min(1)
    .refine(isValidIanaTimezone, {
      message: m.settings_reminders_validation_invalid_timezone(),
    }),
  quietHours: reminderQuietHoursSchema.nullable(),
  zakatDueFollowUpEnabled: z.boolean(),
})

type ReminderPreferenceFormSchemaMessages = {
  requiredTimezone: string
  invalidTimezone: string
  requiredQuietHoursStartTime: string
  requiredQuietHoursEndTime: string
  invalidQuietHoursWindow: string
}

export function createReminderPreferenceFormSchema(
  messages: ReminderPreferenceFormSchemaMessages,
) {
  return z
    .object({
      balanceUpdateCadence: reminderCadenceSchema,
      timezone: z
        .string()
        .trim()
        .min(1, messages.requiredTimezone)
        .refine(isValidIanaTimezone, messages.invalidTimezone),
      quietHoursEnabled: z.enum(["enabled", "disabled"]),
      quietHoursStartTime: z.string().trim(),
      quietHoursEndTime: z.string().trim(),
      zakatDueFollowUpEnabled: z.enum(["enabled", "disabled"]),
    })
    .superRefine((value, context) => {
      if (value.quietHoursEnabled !== "enabled") {
        return
      }

      if (!value.quietHoursStartTime) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["quietHoursStartTime"],
          message: messages.requiredQuietHoursStartTime,
        })
      }

      if (!value.quietHoursEndTime) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["quietHoursEndTime"],
          message: messages.requiredQuietHoursEndTime,
        })
      }

      if (
        value.quietHoursStartTime &&
        value.quietHoursEndTime &&
        value.quietHoursStartTime === value.quietHoursEndTime
      ) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["quietHoursEndTime"],
          message: messages.invalidQuietHoursWindow,
        })
      }
    })
}

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
