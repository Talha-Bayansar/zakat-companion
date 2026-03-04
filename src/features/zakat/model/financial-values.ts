export type StoredFinancialValues = {
  cash: string
  gold: string
  silver: string
  investments: string
  businessAssets: string
  receivables: string
  debtsDue: string
  otherLiabilities: string
  nisab: string
  lastUpdatedAt: string | null
}

export type EditableFinancialField = Exclude<keyof StoredFinancialValues, 'lastUpdatedAt'>

export const defaultFinancialValues: StoredFinancialValues = {
  cash: '',
  gold: '',
  silver: '',
  investments: '',
  businessAssets: '',
  receivables: '',
  debtsDue: '',
  otherLiabilities: '',
  nisab: '5500',
  lastUpdatedAt: null,
}

export function getFinancialValues(): StoredFinancialValues {
  return defaultFinancialValues
}

export function saveFinancialValues(_values: StoredFinancialValues) {
  // Intentionally no-op during reset phase.
}
