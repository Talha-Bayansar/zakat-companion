import type { InfiniteListPage } from "@/shared/lib/infinite-list"

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
  createdAt: string | Date
  updatedAt: string | Date
  entries: WealthSnapshotEntryRecord[]
}

export type WealthSnapshotHistoryPage = InfiniteListPage<WealthSnapshotRecord>
