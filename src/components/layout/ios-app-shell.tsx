import { Link } from '@tanstack/react-router'
import { HugeiconsIcon } from '@hugeicons/react'
import { Home01Icon, DashboardSquare02Icon, UserCircleIcon } from '@hugeicons/core-free-icons'
import { m } from '@/paraglide/messages.js'
import type { PropsWithChildren, ReactNode } from 'react'
import { cn } from '@/lib/utils'

type ShellTab = 'home' | 'dashboard' | 'profile'

type IosAppShellProps = PropsWithChildren<{
  title: string
  subtitle?: string
  activeTab?: ShellTab
  headerAction?: ReactNode
}>

const tabItems: Array<{ key: ShellTab; label: () => string; to: string; icon: typeof Home01Icon }> = [
  { key: 'home', label: () => m.tab_home(), to: '/', icon: Home01Icon },
  { key: 'dashboard', label: () => m.tab_dashboard(), to: '/dashboard', icon: DashboardSquare02Icon },
  { key: 'profile', label: () => m.tab_profile(), to: '/profile', icon: UserCircleIcon },
]

export function IosAppShell({ title, subtitle, activeTab, headerAction, children }: IosAppShellProps) {
  return (
    <main className="ios-shell mx-auto flex min-h-screen w-full max-w-md flex-col bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.92),_rgba(240,244,250,0.96)_45%,_rgba(230,236,245,0.98)_100%)] px-[var(--ios-shell-gutter)] pb-[calc(6.25rem+env(safe-area-inset-bottom))] pt-5 text-slate-900">
      <header className="ios-glass-card mb-5 p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">{m.app_name()}</p>
            <h1 className="mt-1 text-2xl font-semibold tracking-tight">{title}</h1>
            {subtitle ? <p className="mt-1 text-sm text-slate-600">{subtitle}</p> : null}
          </div>
          {headerAction}
        </div>
      </header>

      <section className="ios-page-stack flex-1">{children}</section>

      <div className="fixed inset-x-0 bottom-[calc(1rem+env(safe-area-inset-bottom))] px-[var(--ios-shell-gutter)]">
        <nav className="mx-auto flex w-full justify-between rounded-3xl border border-white/70 bg-white/85 p-2 shadow-[0_20px_44px_rgba(15,23,42,0.18)] backdrop-blur-2xl">
          {tabItems.map((item) => {
            const Icon = item.icon
            const isActive = activeTab === item.key

            return (
              <Link
                key={item.key}
                to={item.to}
                data-active={isActive}
                className={cn(
                  'ios-nav-item ios-tap flex w-full flex-col items-center justify-center rounded-2xl px-3 py-2 text-[11px] font-medium',
                  isActive
                    ? 'bg-slate-900 text-white shadow-[0_12px_30px_rgba(15,23,42,0.28)]'
                    : 'text-slate-500 hover:bg-white/60 hover:text-slate-900',
                )}
              >
                <HugeiconsIcon icon={Icon} strokeWidth={2.2} className="mb-1 h-5 w-5" />
                {item.label()}
              </Link>
            )
          })}
        </nav>
      </div>
    </main>
  )
}
