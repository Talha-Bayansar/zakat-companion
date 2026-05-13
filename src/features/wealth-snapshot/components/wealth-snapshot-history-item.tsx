import { m } from "@/paraglide/messages"

import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemTitle,
} from "@/shared/ui/item"

import type { WealthSnapshotRecord } from "../lib/wealth-snapshot.types"

type WealthSnapshotHistoryItemProps = {
  snapshot: WealthSnapshotRecord
}

export function WealthSnapshotHistoryItem({
  snapshot,
}: WealthSnapshotHistoryItemProps) {
  return (
    <Item variant="outline">
      <ItemContent>
        <ItemTitle>{new Date(snapshot.createdAt).toLocaleString()}</ItemTitle>
        <ItemDescription>
          {m.wealth_snapshot_history_row_description()}
        </ItemDescription>
      </ItemContent>

      <ItemActions className="ml-auto flex flex-col items-end">
        <span className="text-sm font-medium tabular-nums">
          {formatSnapshotAmount(snapshot.entries)}
        </span>
        <span className="text-xs text-muted-foreground">
          {m.wealth_snapshot_current_net_label()}
        </span>
      </ItemActions>
    </Item>
  )
}

function formatSnapshotAmount(entries: WealthSnapshotRecord["entries"]) {
  const amount = entries.reduce((total, entry) => {
    const parsed = Number(entry.amount)
    const normalized = Number.isFinite(parsed) ? parsed : 0

    return entry.category === "debts_liabilities"
      ? total - normalized
      : total + normalized
  }, 0)

  return new Intl.NumberFormat(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)
}
