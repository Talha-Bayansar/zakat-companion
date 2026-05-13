import { z } from "zod"

import { MAX_INFINITE_LIST_PAGE_SIZE } from "@/shared/lib/infinite-list"

import { wealthCategoryValues } from "../../lib/wealth-snapshot.constants"

const wealthAmountSchema = z.string().trim().regex(/^\d+(?:\.\d{1,2})?$/)

export const wealthSnapshotEntryInputSchema = z.object({
  category: z.enum(wealthCategoryValues),
  amount: wealthAmountSchema,
})

export const replaceWealthSnapshotInputSchema = z.object({
  profileId: z.string().trim().min(1),
  entries: z.array(wealthSnapshotEntryInputSchema).min(1),
})

export const listWealthSnapshotHistoryInputSchema = z.object({
  page: z.number().int().min(1),
  pageSize: z.number().int().min(1).max(MAX_INFINITE_LIST_PAGE_SIZE),
})

export type WealthCategory = z.infer<typeof wealthSnapshotEntryInputSchema>["category"]
export type WealthSnapshotEntryInput = z.infer<
  typeof wealthSnapshotEntryInputSchema
>
export type ReplaceWealthSnapshotInput = z.infer<
  typeof replaceWealthSnapshotInputSchema
>
export type ListWealthSnapshotHistoryInput = z.infer<
  typeof listWealthSnapshotHistoryInputSchema
>
