import { z } from 'zod'

export type ZakatSchool = 'hanafi' | 'standard'

export type UserPreferences = {
  zakatSchool: ZakatSchool
  currency: string
  reminderDay: number
  reminderTime: string
  notificationsEnabled: boolean
}

const STORAGE_KEY = 'zakat-companion.preferences.v1'

const preferencesSchema = z.object({
  zakatSchool: z.enum(['hanafi', 'standard']).default('standard'),
  currency: z
    .string()
    .trim()
    .toUpperCase()
    .length(3)
    .default('EUR'),
  reminderDay: z.number().int().min(1).max(28).default(10),
  reminderTime: z
    .string()
    .regex(/^([01]\d|2[0-3]):([0-5]\d)$/)
    .default('09:00'),
  notificationsEnabled: z.boolean().default(true),
})

export const defaultPreferences: UserPreferences = {
  zakatSchool: 'standard',
  currency: 'EUR',
  reminderDay: 10,
  reminderTime: '09:00',
  notificationsEnabled: true,
}

export function getPreferences(): UserPreferences {
  if (typeof window === 'undefined') return defaultPreferences

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return defaultPreferences

    const parsed = preferencesSchema.safeParse(JSON.parse(raw))
    if (!parsed.success) return defaultPreferences

    return parsed.data
  } catch {
    return defaultPreferences
  }
}

export function savePreferences(next: UserPreferences) {
  if (typeof window === 'undefined') return

  const parsed = preferencesSchema.safeParse(next)
  if (!parsed.success) return

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(parsed.data))
}
