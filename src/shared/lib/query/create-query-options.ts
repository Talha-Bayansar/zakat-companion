import { queryOptions } from '@tanstack/react-query'

export const createQueryOptions = <TQueryFnData, TError = Error>(input: {
  queryKey: readonly unknown[]
  queryFn: () => Promise<TQueryFnData>
  staleTime?: number
}) => queryOptions<TQueryFnData, TError>(input)
