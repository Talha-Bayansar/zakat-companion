import { z } from "zod"

import { m } from "@/paraglide/messages"
import { wealthCategoryValues } from "./wealth-snapshot.constants"

export const wealthSnapshotAmountSchema = z
  .string()
  .trim()
  .regex(/^\d+(?:\.\d{1,2})?$/, m.wealth_snapshot_amount_invalid())

export const wealthSnapshotEntrySchema = z.object({
  category: z.enum(wealthCategoryValues),
  amount: wealthSnapshotAmountSchema,
})

export const wealthSnapshotFormSchema = z.object({
  cash: wealthSnapshotAmountSchema,
  gold: wealthSnapshotAmountSchema,
  silver: wealthSnapshotAmountSchema,
  trade_inventory: wealthSnapshotAmountSchema,
  receivables: wealthSnapshotAmountSchema,
  debts_liabilities: wealthSnapshotAmountSchema,
})

export type WealthCategory = (typeof wealthCategoryValues)[number]
export type WealthSnapshotEntryInput = z.infer<typeof wealthSnapshotEntrySchema>
export type WealthSnapshotFormValues = z.infer<typeof wealthSnapshotFormSchema>
