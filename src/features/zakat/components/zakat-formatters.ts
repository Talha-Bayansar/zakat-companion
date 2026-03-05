import Decimal from 'decimal.js'
import { formatMoney } from '@/features/zakat/model/calculate-zakat'

export function formatFromStored(amount: string, currency: string) {
  try {
    return formatMoney(new Decimal(amount), currency)
  } catch {
    return formatMoney(new Decimal(0), currency)
  }
}

export function formatAssessmentDate(value: string) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return 'Unknown date'

  return new Intl.DateTimeFormat(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}

export function formatLastUpdated(value: string | null) {
  if (!value) return 'Last updated: not yet saved'

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return 'Last updated: unknown'

  return `Last updated: ${new Intl.DateTimeFormat(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)}`
}
