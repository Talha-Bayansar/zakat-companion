import { useEffect, useState } from 'react'
import { baseLocale, getLocalePreference, type Locale, persistLocale } from './i18n'

export function useLocale() {
  const [locale, setLocale] = useState<Locale>(baseLocale)

  useEffect(() => {
    setLocale(getLocalePreference())
  }, [])

  useEffect(() => {
    document.documentElement.lang = locale
  }, [locale])

  function updateLocale(nextLocale: Locale) {
    persistLocale(nextLocale)
    setLocale(nextLocale)
  }

  return {
    locale,
    setLocale: updateLocale,
  }
}
