import type { z } from "zod"

import type {
  historyCycleHistoryPageSchema,
  historyCycleRecordSchema,
  historyReminderDeliveryAttemptSchema,
  historyReminderJobSchema,
  historySourceSnapshotSummarySchema,
} from "./history.schemas"

export type HistorySourceSnapshotSummary = z.infer<
  typeof historySourceSnapshotSummarySchema
>

export type HistoryReminderDeliveryAttempt = z.infer<
  typeof historyReminderDeliveryAttemptSchema
>

export type HistoryReminderJob = z.infer<typeof historyReminderJobSchema>

export type HistoryCycleRecord = z.infer<typeof historyCycleRecordSchema>

export type HistoryCycleHistoryPage = z.infer<
  typeof historyCycleHistoryPageSchema
>

