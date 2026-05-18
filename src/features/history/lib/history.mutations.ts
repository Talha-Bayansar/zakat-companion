import { useMutation, useQueryClient } from "@tanstack/react-query"

import { markCyclePaidFn } from "../server/functions/history.function"
import { historyCyclesQueryKey } from "./history.query"

export function useMarkCyclePaidMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (zakatCycleId: string) =>
      markCyclePaidFn({ data: { zakatCycleId } }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: historyCyclesQueryKey })
    },
  })
}

