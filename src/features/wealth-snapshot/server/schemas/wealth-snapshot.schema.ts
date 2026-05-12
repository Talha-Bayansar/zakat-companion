import { z } from "zod"

import { wealthCategoryValues } from "@/server/db/schema"

const wealthAmountSchema = z.string().trim().regex(/^\d+(?:\.\d{1,2})?$/)

export const wealthSnapshotEntryInputSchema = z.object({
  category: z.enum(wealthCategoryValues),
  amount: wealthAmountSchema,
})

export const replaceWealthSnapshotInputSchema = z.object({
  profileId: z.string().trim().min(1),
  entries: z.array(wealthSnapshotEntryInputSchema).min(1),
})

export type WealthCategory = z.infer<typeof wealthSnapshotEntryInputSchema>["category"]
export type WealthSnapshotEntryInput = z.infer<
  typeof wealthSnapshotEntryInputSchema
>
export type ReplaceWealthSnapshotInput = z.infer<
  typeof replaceWealthSnapshotInputSchema
>
