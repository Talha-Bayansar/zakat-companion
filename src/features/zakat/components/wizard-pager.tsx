import { HugeiconsIcon } from '@hugeicons/react'
import { ArrowLeft01Icon, ArrowRight01Icon } from '@hugeicons/core-free-icons'
import { Button } from '@/components/ui/button'
import type { WizardStep } from './wizard-step'

export function WizardPager({ step, setStep }: { step: WizardStep; setStep: (step: WizardStep) => void }) {
  return (
    <div className="flex items-center justify-between rounded-2xl border border-white/70 bg-white/70 p-2">
      <Button
        type="button"
        aria-label="Go to previous wizard step"
        className="h-11 w-11 rounded-xl border border-slate-200 bg-white text-slate-800 shadow-none"
        onClick={() => setStep(Math.max(1, step - 1) as WizardStep)}
        disabled={step === 1}
      >
        <HugeiconsIcon icon={ArrowLeft01Icon} strokeWidth={2.2} className="h-5 w-5" />
      </Button>

      <p className="text-xs font-semibold tracking-[0.16em] text-slate-500">STEP {step} OF 3</p>

      {step < 3 ? (
        <Button
          type="button"
          aria-label="Go to next wizard step"
          className="h-11 w-11 rounded-xl bg-slate-900 text-white shadow-[0_10px_24px_rgba(15,23,42,0.22)]"
          onClick={() => setStep(Math.min(3, step + 1) as WizardStep)}
        >
          <HugeiconsIcon icon={ArrowRight01Icon} strokeWidth={2.2} className="h-5 w-5" />
        </Button>
      ) : (
        <Button
          type="button"
          aria-label="Restart wizard from first step"
          className="h-11 w-11 rounded-xl bg-slate-900 text-white shadow-[0_10px_24px_rgba(15,23,42,0.22)]"
          onClick={() => setStep(1)}
        >
          <HugeiconsIcon icon={ArrowLeft01Icon} strokeWidth={2.2} className="h-5 w-5" />
        </Button>
      )}
    </div>
  )
}
