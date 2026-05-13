import { z } from "zod"

import {
  fiqhCycleStateValues,
  fiqhMadhabCodeValues,
  fiqhNisabBenchmarkCodeValues,
} from "./fiqh-calculation.constants"

export const fiqhPreferenceSchema = z.object({
  madhab: z.enum(fiqhMadhabCodeValues),
  nisabBenchmark: z.enum(fiqhNisabBenchmarkCodeValues),
})

export const fiqhSnapshotContextSchema = z.object({
  madhab: z.enum(fiqhMadhabCodeValues).nullable(),
  nisabBenchmark: z.enum(fiqhNisabBenchmarkCodeValues).nullable(),
  calculationVersion: z.string().trim().min(1),
})

export const fiqhSnapshotResultSchema = z.object({
  netZakatableBase: z.string().trim().regex(/^-?\d+(?:\.\d{1,2})?$/),
  isAboveNisab: z.boolean(),
  isZakatDue: z.boolean().nullable(),
})

export const fiqhSnapshotWriteContextSchema = fiqhSnapshotContextSchema.merge(
  fiqhSnapshotResultSchema,
)

export const fiqhCycleStateSchema = z.enum(fiqhCycleStateValues)
