import { type Locale, locales, t } from '../lib/i18n'

type LocaleSwitcherProps = {
  locale: Locale
  setLocale: (locale: Locale) => void
  label: string
}

export function LocaleSwitcher({ locale, setLocale, label }: LocaleSwitcherProps) {
  return (
    <section className="card locale-switcher" aria-label={label}>
      <h2>{label}</h2>
      <div className="locale-options">
        {locales.map((candidate) => (
          <button
            key={candidate}
            type="button"
            className="locale-option"
            aria-pressed={candidate === locale}
            onClick={() => setLocale(candidate)}
          >
            {candidate === 'en'
              ? t(locale, 'language_english')
              : candidate === 'tr'
                ? t(locale, 'language_turkish')
                : t(locale, 'language_dutch')}
          </button>
        ))}
      </div>
    </section>
  )
}
