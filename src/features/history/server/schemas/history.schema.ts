import { z } from "zod"

import { MAX_INFINITE_LIST_PAGE_SIZE } from "@/shared/lib/infinite-list"

export const listHistoryCyclesInputSchema = z.object({
  page: z.number().int().min(1),
  pageSize: z.number().int().min(1).max(MAX_INFINITE_LIST_PAGE_SIZE),
})

export type ListHistoryCyclesInput = z.infer<
  typeof listHistoryCyclesInputSchema
>

export const historyMarkCyclePaidInputSchema = z.object({
  zakatCycleId: z.string().trim().min(1),
})

export type MarkHistoryCyclePaidInput = z.infer<
  typeof historyMarkCyclePaidInputSchema
>
