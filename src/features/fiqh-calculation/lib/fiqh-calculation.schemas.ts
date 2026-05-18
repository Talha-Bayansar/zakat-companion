import { z } from "zod"

import {
  fiqhCalculationVersion,
  fiqhCycleStateValues,
  fiqhDateRulePolicyValues,
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

export const fiqhCalculationInputSchema = z.object({
  madhab: z.enum(fiqhMadhabCodeValues),
  nisabBenchmark: z.enum(fiqhNisabBenchmarkCodeValues),
  netZakatableBase: z.string().trim().regex(/^-?\d+(?:\.\d{1,2})?$/),
  nisabThreshold: z.string().trim().regex(/^-?\d+(?:\.\d{1,2})?$/),
  hawlStartedAt: z.date().nullable(),
  asOf: z.date(),
  calculationVersion: z.string().trim().min(1).default(fiqhCalculationVersion),
})

export const fiqhDateRuleSchema = z.object({
  policy: z.enum(fiqhDateRulePolicyValues),
  summary: z.string().trim().min(1),
})

export const fiqhCalculationExplanationInputsSchema = z.object({
  madhab: z.enum(fiqhMadhabCodeValues),
  nisabBenchmark: z.enum(fiqhNisabBenchmarkCodeValues),
  netZakatableBase: z.string().trim().regex(/^-?\d+(?:\.\d{1,2})?$/),
  nisabThreshold: z.string().trim().regex(/^-?\d+(?:\.\d{1,2})?$/),
  hawlStartedAt: z.string().trim().min(1).nullable(),
  asOf: z.string().trim().min(1),
})

export const fiqhCalculationNisabExplanationSchema = z.object({
  netZakatableBase: z.string().trim().regex(/^-?\d+(?:\.\d{1,2})?$/),
  nisabThreshold: z.string().trim().regex(/^-?\d+(?:\.\d{1,2})?$/),
  difference: z.string().trim().regex(/^-?\d+(?:\.\d{1,2})?$/),
  isAboveNisab: z.boolean(),
})

export const fiqhCalculationHawlExplanationSchema = z.object({
  startedAt: z.string().trim().min(1).nullable(),
  asOf: z.string().trim().min(1),
  elapsedDays: z.number().int().nonnegative().nullable(),
  requiredDays: z.number().int().positive(),
  isComplete: z.boolean(),
  resetRequired: z.boolean(),
})

export const fiqhCalculationDueAmountExplanationSchema = z.object({
  rate: z.string().trim().regex(/^0\.\d+$/),
  amount: z.string().trim().regex(/^-?\d+(?:\.\d{1,2})?$/),
  isZakatDue: z.boolean(),
})

export const fiqhCalculationBenchmarkFreshnessExplanationSchema = z.object({
  isStale: z.boolean(),
  label: z.string().trim().min(1),
})

export const fiqhCalculationBenchmarkExplanationSchema = z.object({
  currency: z.string().trim().min(1),
  provider: z.string().trim().min(1),
  goldPrice: z.string().trim().regex(/^-?\d+(?:\.\d{1,2})?$/),
  silverPrice: z.string().trim().regex(/^-?\d+(?:\.\d{1,2})?$/),
  sourceTimestamp: z.string().trim().min(1),
  lastSuccessfulAt: z.string().trim().min(1),
  selectedBenchmark: z.enum(fiqhNisabBenchmarkCodeValues),
  selectedBenchmarkPrice: z.string().trim().regex(/^-?\d+(?:\.\d{1,2})?$/),
  nisabThreshold: z.string().trim().regex(/^-?\d+(?:\.\d{1,2})?$/),
  freshness: fiqhCalculationBenchmarkFreshnessExplanationSchema,
})

export const fiqhCalculationExplanationSchema = z.object({
  inputs: fiqhCalculationExplanationInputsSchema,
  nisab: fiqhCalculationNisabExplanationSchema,
  hawl: fiqhCalculationHawlExplanationSchema,
  dueAmount: fiqhCalculationDueAmountExplanationSchema,
  dateRule: fiqhDateRuleSchema,
  benchmark: fiqhCalculationBenchmarkExplanationSchema.optional(),
})

export const fiqhHawlProgressSchema = z.object({
  startedAt: z.date().nullable(),
  asOf: z.date(),
  elapsedDays: z.number().int().nonnegative().nullable(),
  requiredDays: z.number().int().positive(),
  isComplete: z.boolean(),
  resetRequired: z.boolean(),
})

export const fiqhCalculationOutcomeSchema = z.object({
  snapshot: fiqhSnapshotWriteContextSchema,
  nisabThreshold: z.string().trim().regex(/^-?\d+(?:\.\d{1,2})?$/),
  nisabDifference: z.string().trim().regex(/^-?\d+(?:\.\d{1,2})?$/),
  zakatRate: z.string().trim().regex(/^0\.\d+$/),
  zakatDueAmount: z.string().trim().regex(/^-?\d+(?:\.\d{1,2})?$/),
  dateRule: fiqhDateRuleSchema,
  hawl: fiqhHawlProgressSchema,
  explanation: fiqhCalculationExplanationSchema,
})
