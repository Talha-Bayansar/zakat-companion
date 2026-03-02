import Decimal from 'decimal.js'
import { calculateZakatDue } from '@/entities/zakat-assessment/lib/calculate-zakat-due'
import type { CalculateZakatInput } from '../model/calculate-zakat-schema'

export const runZakatCalculation = (input: CalculateZakatInput) => {
  const zakatableTotal = new Decimal(input.assets).minus(input.liabilities)
  const amountDue = calculateZakatDue(Decimal.max(zakatableTotal, 0))

  return { zakatableTotal, amountDue }
}
