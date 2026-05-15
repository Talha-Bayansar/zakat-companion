import { useMutation, useQueryClient } from "@tanstack/react-query"

import {
  refreshWealthSnapshotFn,
  replaceWealthSnapshotFn,
} from "../server/functions/wealth-snapshot.function"
import type { WealthSnapshotEntryInput } from "./wealth-snapshot.schemas"

import {
  wealthSnapshotHistoryQueryKey,
  wealthSnapshotQueryKey,
} from "./wealth-snapshot.query"

export function useReplaceWealthSnapshotMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (entries: WealthSnapshotEntryInput[]) =>
      replaceWealthSnapshotFn({ data: { entries } }),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: wealthSnapshotQueryKey }),
        queryClient.invalidateQueries({
          queryKey: wealthSnapshotHistoryQueryKey,
        }),
      ])
    },
  })
}

export function useRefreshWealthSnapshotMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (entries: WealthSnapshotEntryInput[]) =>
      refreshWealthSnapshotFn({ data: { entries } }),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: wealthSnapshotQueryKey }),
        queryClient.invalidateQueries({
          queryKey: wealthSnapshotHistoryQueryKey,
        }),
      ])
    },
  })
}
