export type ZakatSchool = 'hanafi' | 'standard'

export type UserPreferences = {
  zakatSchool: ZakatSchool
  currency: string
  reminderDay: number
  reminderTime: string
  notificationsEnabled: boolean
}

export const defaultPreferences: UserPreferences = {
  zakatSchool: 'standard',
  currency: 'EUR',
  reminderDay: 10,
  reminderTime: '09:00',
  notificationsEnabled: true,
}

export function getPreferences(): UserPreferences {
  return defaultPreferences
}

export function savePreferences(_next: UserPreferences) {
  // Intentionally no-op during reset phase.
  // We will add persistence back incrementally: auth -> DB -> local fallback.
}
