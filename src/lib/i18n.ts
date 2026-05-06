import enMessages from '../../messages/en.json'
import nlMessages from '../../messages/nl.json'
import trMessages from '../../messages/tr.json'

export const locales = ['en', 'tr', 'nl'] as const

export type Locale = (typeof locales)[number]

export const baseLocale: Locale = 'en'

const messages = {
  en: enMessages,
  tr: trMessages,
  nl: nlMessages,
} as const

export type MessageKey = keyof typeof enMessages

const storageKey = 'zakat-companion-locale'

export function getLocalePreference(): Locale {
  if (typeof window === 'undefined') {
    return baseLocale
  }

  const stored = window.localStorage.getItem(storageKey)
  return isLocale(stored) ? stored : baseLocale
}

export function persistLocale(locale: Locale) {
  if (typeof window === 'undefined') {
    return
  }

  window.localStorage.setItem(storageKey, locale)
}

export function t(locale: Locale, key: MessageKey): string {
  return messages[locale][key]
}

function isLocale(value: string | null): value is Locale {
  return value !== null && locales.includes(value as Locale)
}
