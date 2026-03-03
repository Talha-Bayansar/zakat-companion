import { z } from 'zod'

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

const STORAGE_KEY = 'zakat-companion.financial-values.v2'
const LEGACY_STORAGE_KEY = 'zakat-companion.financial-values.v1'

const financialValuesSchema = z.object({
  cash: z.string().default(''),
  gold: z.string().default(''),
  silver: z.string().default(''),
  investments: z.string().default(''),
  businessAssets: z.string().default(''),
  receivables: z.string().default(''),
  debtsDue: z.string().default(''),
  otherLiabilities: z.string().default(''),
  nisab: z.string().default('5500'),
  lastUpdatedAt: z.string().nullable().default(null),
})

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
  if (typeof window === 'undefined') return defaultFinancialValues

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = financialValuesSchema.safeParse(JSON.parse(raw))
      if (parsed.success) return parsed.data
    }

    const legacyRaw = window.localStorage.getItem(LEGACY_STORAGE_KEY)
    if (!legacyRaw) return defaultFinancialValues

    const parsedLegacy = financialValuesSchema.safeParse(JSON.parse(legacyRaw))
    if (!parsedLegacy.success) return defaultFinancialValues

    const migrated = {
      ...parsedLegacy.data,
      lastUpdatedAt: null,
    }

    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(migrated))
    return migrated
  } catch {
    return defaultFinancialValues
  }
}

export function saveFinancialValues(values: StoredFinancialValues) {
  if (typeof window === 'undefined') return

  const parsed = financialValuesSchema.safeParse(values)
  if (!parsed.success) return

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(parsed.data))
}
