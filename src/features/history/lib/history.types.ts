import type { z } from "zod"

import type {
  historyCycleHistoryPageSchema,
  historyCycleRecordSchema,
  historySourceSnapshotSummarySchema,
} from "./history.schemas"

export type HistorySourceSnapshotSummary = z.infer<
  typeof historySourceSnapshotSummarySchema
>

export type HistoryCycleRecord = z.infer<typeof historyCycleRecordSchema>

export type HistoryCycleHistoryPage = z.infer<
  typeof historyCycleHistoryPageSchema
>

