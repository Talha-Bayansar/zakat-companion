import { z } from "zod"

import {
  reminderJobPhaseSchema,
  reminderPreferenceSchema,
  zakatCycleSchema,
} from "../../lib/reminders.schemas"

export const reminderPreferenceUpdateInputSchema = reminderPreferenceSchema

export const balanceUpdateReminderJobInputSchema = z.object({
  scheduledFor: z.date(),
})

export const zakatDueReminderJobInputSchema = z.object({
  zakatCycleId: z.string().trim().min(1),
  phase: reminderJobPhaseSchema,
  scheduledFor: z.date(),
})

export const reminderJobInputSchema = z.discriminatedUnion("kind", [
  z
    .object({
      kind: z.literal("balance_update"),
    })
    .merge(balanceUpdateReminderJobInputSchema),
  z
    .object({
      kind: z.literal("zakat_due"),
    })
    .merge(zakatDueReminderJobInputSchema),
])

export const createZakatCycleInputSchema = z.object({
  profileId: z.string().trim().min(1),
  sourceSnapshotId: z.string().trim().min(1).nullable().optional(),
  state: zakatCycleSchema.shape.state,
  dueAt: z.date(),
  paidAt: z.date().nullable().optional(),
})

export type ReminderPreferenceUpdateInput = z.infer<
  typeof reminderPreferenceUpdateInputSchema
>
export type BalanceUpdateReminderJobInput = z.infer<
  typeof balanceUpdateReminderJobInputSchema
>
export type ZakatDueReminderJobInput = z.infer<
  typeof zakatDueReminderJobInputSchema
>
export type ReminderJobInput = z.infer<typeof reminderJobInputSchema>
export type CreateZakatCycleInput = z.infer<typeof createZakatCycleInputSchema>
