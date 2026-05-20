export const hawlStartedAtInputPattern = /^\d{4}-\d{2}-\d{2}$/

export function formatHawlStartedAtInputValue(value: Date | null) {
  if (!value) {
    return ""
  }

  const year = String(value.getUTCFullYear()).padStart(4, "0")
  const month = String(value.getUTCMonth() + 1).padStart(2, "0")
  const day = String(value.getUTCDate()).padStart(2, "0")

  return `${year}-${month}-${day}`
}

export function formatHawlStartedAtDisplayValue(value: Date | null) {
  if (!value) {
    return null
  }

  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeZone: "UTC",
  }).format(value)
}

export function parseHawlStartedAtInputValue(value: string | null | undefined) {
  if (!value) {
    return null
  }

  const parsed = new Date(`${value}T00:00:00.000Z`)

  return Number.isNaN(parsed.getTime()) ? null : parsed
}
