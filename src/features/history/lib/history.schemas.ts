import { z } from "zod"

import { fiqhCalculationExplanationSchema } from "@/features/fiqh-calculation"
import {
  fiqhCycleStateValues,
  fiqhMadhabCodeValues,
  fiqhNisabBenchmarkCodeValues,
} from "@/features/fiqh-calculation"

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
