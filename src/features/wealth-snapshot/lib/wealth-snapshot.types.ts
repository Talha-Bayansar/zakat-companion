import type { InfiniteListPage } from "@/shared/lib/infinite-list"

import type {
  FiqhCalculationExplanation,
  FiqhCalculationSnapshot,
  FiqhMadhabCode,
  FiqhNisabBenchmarkCode,
} from "@/features/fiqh-calculation"
import type { WealthCategory } from "./wealth-snapshot.constants"

export type WealthSnapshotEntryRecord = {
  id: string
  snapshotId: string
  category: WealthCategory
  amount: string
  createdAt: string | Date
  updatedAt: string | Date
}

export type WealthSnapshotRecord = {
  id: string
  profileId: string
  capturedAt: string | Date
  madhab: FiqhMadhabCode | null
  nisabBenchmark: FiqhNisabBenchmarkCode | null
  calculationVersion: FiqhCalculationSnapshot["calculationVersion"] | null
  netZakatableBase: FiqhCalculationSnapshot["netZakatableBase"] | null
  isAboveNisab: FiqhCalculationSnapshot["isAboveNisab"] | null
  isZakatDue: FiqhCalculationSnapshot["isZakatDue"] | null
  fiqhExplanation: FiqhCalculationExplanation | null
  createdAt: string | Date
  updatedAt: string | Date
  entries: WealthSnapshotEntryRecord[]
}

export type WealthSnapshotHistoryPage = InfiniteListPage<WealthSnapshotRecord>
