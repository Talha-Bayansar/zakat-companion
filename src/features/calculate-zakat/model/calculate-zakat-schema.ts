import { z } from 'zod'

export const calculateZakatSchema = z.object({
  assets: z.number().nonnegative(),
  liabilities: z.number().nonnegative()
})

export type CalculateZakatInput = z.infer<typeof calculateZakatSchema>
