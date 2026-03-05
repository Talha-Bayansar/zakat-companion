import type { ReactNode } from 'react'

export function WizardSection({ title, hint, children }: { title: string; hint: string; children: ReactNode }) {
  return (
    <section className="space-y-2.5 rounded-2xl border border-white/70 bg-white/70 p-2.5">
      <div>
        <p className="text-sm font-semibold text-slate-900">{title}</p>
        <p className="mt-1 text-xs text-slate-600">{hint}</p>
      </div>
      {children}
    </section>
  )
}
