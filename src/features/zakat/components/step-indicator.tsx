import type { WizardStep } from './wizard-step'
import { m } from '@/paraglide/messages.js'

export function StepIndicator({ step }: { step: WizardStep }) {
  const steps: Array<{ id: WizardStep; label: string }> = [
    { id: 1, label: m.step_assets() },
    { id: 2, label: m.step_liabilities() },
    { id: 3, label: m.step_nisab() },
  ]

  return (
    <div className="grid grid-cols-3 gap-1.5">
      {steps.map((item) => {
        const active = step === item.id
        const done = step > item.id

        return (
          <div
            key={item.id}
            className={active || done ? 'rounded-xl bg-slate-900 px-2.5 py-2 text-center text-xs font-medium text-white' : 'rounded-xl bg-slate-100 px-2.5 py-2 text-center text-xs font-medium text-slate-500'}
          >
            {item.id}. {item.label}
          </div>
        )
      })}
    </div>
  )
}
