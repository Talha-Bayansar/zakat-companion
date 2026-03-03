import Decimal from 'decimal.js'

export type ZakatCalculationInput = {
  cash: string
  gold: string
  silver: string
  investments: string
  businessAssets: string
  receivables: string
  debtsDue: string
  otherLiabilities: string
  nisab: string
}

export type ZakatCalculationResult = {
  totalAssets: Decimal
  totalLiabilities: Decimal
  netWorth: Decimal
  nisab: Decimal
  isEligible: boolean
  zakatDue: Decimal
}

function toMoneyDecimal(value: string) {
  if (!value.trim()) return new Decimal(0)

  try {
    const normalized = value.replaceAll(',', '.').trim()
    const amount = new Decimal(normalized)
    return amount.isNegative() ? new Decimal(0) : amount
  } catch {
    return new Decimal(0)
  }
}

export function calculateZakat(input: ZakatCalculationInput): ZakatCalculationResult {
  const cash = toMoneyDecimal(input.cash)
  const gold = toMoneyDecimal(input.gold)
  const silver = toMoneyDecimal(input.silver)
  const investments = toMoneyDecimal(input.investments)
  const businessAssets = toMoneyDecimal(input.businessAssets)
  const receivables = toMoneyDecimal(input.receivables)

  const debtsDue = toMoneyDecimal(input.debtsDue)
  const otherLiabilities = toMoneyDecimal(input.otherLiabilities)
  const nisab = toMoneyDecimal(input.nisab)

  const totalAssets = cash
    .plus(gold)
    .plus(silver)
    .plus(investments)
    .plus(businessAssets)
    .plus(receivables)

  const totalLiabilities = debtsDue.plus(otherLiabilities)
  const netWorth = Decimal.max(totalAssets.minus(totalLiabilities), 0)
  const isEligible = netWorth.greaterThanOrEqualTo(nisab) && nisab.greaterThan(0)
  const zakatDue = isEligible ? netWorth.mul(0.025) : new Decimal(0)

  return {
    totalAssets,
    totalLiabilities,
    netWorth,
    nisab,
    isEligible,
    zakatDue,
  }
}

export function formatMoney(value: Decimal, currency: string) {
  const safeCurrency = currency?.trim().toUpperCase() || 'EUR'

  try {
    return new Intl.NumberFormat(undefined, {
      style: 'currency',
      currency: safeCurrency,
      maximumFractionDigits: 2,
      minimumFractionDigits: 2,
    }).format(value.toNumber())
  } catch {
    return `${value.toFixed(2)} ${safeCurrency}`
  }
}
