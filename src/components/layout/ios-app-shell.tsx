import { Link } from '@tanstack/react-router'
import { Home, LayoutDashboard, UserRound } from 'lucide-react'
import { m } from '@/paraglide/messages.js'
import { getLocale, locales, setLocale } from '@/paraglide/runtime.js'
import type { PropsWithChildren, ReactNode } from 'react'
import { cn } from '@/lib/utils'

type ShellTab = 'home' | 'dashboard' | 'profile'

type IosAppShellProps = PropsWithChildren<{
  title: string
  subtitle?: string
  activeTab?: ShellTab
  headerAction?: ReactNode
}>

const tabItems: Array<{ key: ShellTab; label: () => string; to: string; icon: typeof Home }> = [
  { key: 'home', label: () => m.tab_home(), to: '/', icon: Home },
  { key: 'dashboard', label: () => m.tab_dashboard(), to: '/dashboard', icon: LayoutDashboard },
  { key: 'profile', label: () => m.tab_profile(), to: '/profile', icon: UserRound },
]

function localeLabel(locale: (typeof locales)[number]) {
  if (locale === 'tr') return m.language_turkish()
  if (locale === 'nl') return m.language_dutch()
  return m.language_english()
}

export function IosAppShell({ title, subtitle, activeTab, headerAction, children }: IosAppShellProps) {
  const activeLocale = getLocale()

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md flex-col bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.9),_rgba(240,244,250,0.95)_45%,_rgba(230,236,245,0.95)_100%)] px-4 pb-28 pt-6 text-slate-900">
      <header className="mb-5 rounded-3xl border border-white/60 bg-white/70 p-4 shadow-[0_12px_32px_rgba(15,23,42,0.08)] backdrop-blur-xl">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">{m.app_name()}</p>
            <h1 className="mt-1 text-2xl font-semibold tracking-tight">{title}</h1>
            {subtitle ? <p className="mt-1 text-sm text-slate-600">{subtitle}</p> : null}
          </div>
          {headerAction}
        </div>

        <div className="mt-4">
          <label className="mb-1 block text-xs font-medium text-slate-500" htmlFor="locale-switcher">
            {m.language_label()}
          </label>
          <select
            id="locale-switcher"
            className="h-10 w-full rounded-2xl border border-slate-200 bg-white/80 px-3 text-sm"
            value={activeLocale}
            onChange={(event) => {
              const next = event.target.value as (typeof locales)[number]
              setLocale(next)
            }}
          >
            {locales.map((locale) => (
              <option key={locale} value={locale}>
                {localeLabel(locale)}
              </option>
            ))}
          </select>
        </div>
      </header>

      <section className="flex-1 space-y-4">{children}</section>

      <nav className="fixed inset-x-0 bottom-5 mx-auto flex w-[calc(100%-2rem)] max-w-md justify-between rounded-3xl border border-white/60 bg-white/80 p-2 shadow-[0_20px_50px_rgba(15,23,42,0.18)] backdrop-blur-2xl">
        {tabItems.map((item) => {
          const Icon = item.icon
          const isActive = activeTab === item.key

          return (
            <Link
              key={item.key}
              to={item.to}
              className={cn(
                'flex w-full flex-col items-center justify-center rounded-2xl px-3 py-2 text-[11px] font-medium transition',
                isActive
                  ? 'bg-slate-900 text-white shadow-[0_12px_30px_rgba(15,23,42,0.28)]'
                  : 'text-slate-500 hover:bg-white/60 hover:text-slate-900',
              )}
            >
              <Icon className="mb-1 h-4 w-4" />
              {item.label()}
            </Link>
          )
        })}
      </nav>
    </main>
  )
}
