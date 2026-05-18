import { z } from "zod"

import { fiqhCalculationExplanationSchema } from "@/features/fiqh-calculation"
import {
  fiqhCycleStateValues,
  fiqhMadhabCodeValues,
  fiqhNisabBenchmarkCodeValues,
} from "@/features/fiqh-calculation"
import {
  notificationChannelValues,
  notificationDeliveryAttemptStatusValues,
} from "@/features/notifications/lib/notifications.constants"
import {
  reminderJobKindValues,
  reminderJobPhaseValues,
  reminderJobStatusValues,
} from "@/features/reminders/lib/reminders.constants"

const monetaryValueSchema = z.string().trim().regex(/^-?\d+(?:\.\d{1,2})?$/)

export const historySourceSnapshotSummarySchema = z.object({
  id: z.string().trim().min(1),
  capturedAt: z.date(),
  madhab: z.enum(fiqhMadhabCodeValues).nullable(),
  nisabBenchmark: z.enum(fiqhNisabBenchmarkCodeValues).nullable(),
  calculationVersion: z.string().trim().min(1).nullable(),
  netZakatableBase: monetaryValueSchema.nullable(),
  isAboveNisab: z.boolean().nullable(),
  isZakatDue: z.boolean().nullable(),
  fiqhExplanation: fiqhCalculationExplanationSchema.nullable(),
})

export const historyReminderDeliveryAttemptSchema = z.object({
  id: z.string().trim().min(1),
  reminderJobId: z.string().trim().min(1),
  subscriptionId: z.string().trim().min(1),
  channel: z.enum(notificationChannelValues),
  kind: z.enum(reminderJobKindValues),
  status: z.enum(notificationDeliveryAttemptStatusValues),
  attemptedAt: z.date(),
  deliveredAt: z.date().nullable(),
  errorMessage: z.string().trim().min(1).nullable(),
})

const historyReminderJobBaseSchema = z.object({
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
  deliveryAttempts: z.array(historyReminderDeliveryAttemptSchema),
})

export const historyBalanceUpdateReminderJobSchema = historyReminderJobBaseSchema.extend(
  {
    kind: z.literal("balance_update"),
    zakatCycleId: z.null(),
    phase: z.null(),
  },
)

export const historyZakatDueReminderJobSchema = historyReminderJobBaseSchema.extend({
  kind: z.literal("zakat_due"),
  zakatCycleId: z.string().trim().min(1),
  phase: z.enum(reminderJobPhaseValues),
})

export const historyReminderJobSchema = z.discriminatedUnion("kind", [
  historyBalanceUpdateReminderJobSchema,
  historyZakatDueReminderJobSchema,
])

export const historyCycleRecordSchema = z.object({
  id: z.string().trim().min(1),
  profileId: z.string().trim().min(1),
  sourceSnapshotId: z.string().trim().min(1).nullable(),
  state: z.enum(fiqhCycleStateValues),
  dueAt: z.date(),
  paidAt: z.date().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
  sourceSnapshot: historySourceSnapshotSummarySchema.nullable(),
  reminderJobs: z.array(historyReminderJobSchema),
})

export const historyCycleHistoryPageSchema = z.object({
  items: z.array(historyCycleRecordSchema),
  page: z.number().int().positive(),
  pageSize: z.number().int().positive(),
  hasMore: z.boolean(),
})

export const historyMarkCyclePaidInputSchema = z.object({
  zakatCycleId: z.string().trim().min(1),
})

export type MarkHistoryCyclePaidInput = z.infer<
  typeof historyMarkCyclePaidInputSchema
>
