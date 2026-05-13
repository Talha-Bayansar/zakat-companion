export const wealthCategoryValues = [
  "cash",
  "gold",
  "silver",
  "trade_inventory",
  "receivables",
  "debts_liabilities",
] as const

export type WealthCategory = (typeof wealthCategoryValues)[number]
