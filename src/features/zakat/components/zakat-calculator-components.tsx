import { HugeiconsIcon } from '@hugeicons/react'
import { ArrowLeft01Icon, ArrowRight01Icon, Tick01Icon } from '@hugeicons/core-free-icons'
import type { ReactNode } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import type { AssessmentSnapshot } from '@/features/zakat/model/assessment-history'
import { formatAssessmentDate, formatFromStored } from './zakat-formatters'

export type WizardStep = 1 | 2 | 3

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

export function StepIndicator({ step }: { step: WizardStep }) {
  const steps: Array<{ id: WizardStep; label: string }> = [
    { id: 1, label: 'Assets' },
    { id: 2, label: 'Liabilities' },
    { id: 3, label: 'Nisab' },
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

export function ResultCard({
  currency,
  totalAssets,
  totalLiabilities,
  netWorth,
  nisab,
  zakatDue,
  isEligible,
  isSaving,
  onSaveAssessment,
}: {
  currency: string
  totalAssets: string
  totalLiabilities: string
  netWorth: string
  nisab: string
  zakatDue: string
  isEligible: boolean
  isSaving: boolean
  onSaveAssessment: () => void | Promise<void>
}) {
  return (
    <Card className="ios-surface">
      <CardHeader>
        <CardTitle className="ios-section-title">Zakat result</CardTitle>
        <p className="ios-copy-muted">Live result in {currency}. Updates as you type.</p>
      </CardHeader>
      <CardContent className="space-y-2 text-sm">
        <SummaryRow label="Total assets" value={totalAssets} />
        <SummaryRow label="Total liabilities" value={totalLiabilities} />
        <SummaryRow label="Net zakatable wealth" value={netWorth} />
        <SummaryRow label="Nisab" value={nisab} />

        <div className="mt-1.5 rounded-2xl border border-slate-200/80 bg-white/80 p-3.5">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Zakat due</p>
          <p className="mt-1.5 text-2xl font-semibold text-slate-900">{zakatDue}</p>
          <p className="mt-1 text-sm text-slate-600">
            {isEligible
              ? 'You are above nisab. Zakat due is 2.5% of your net zakatable wealth.'
              : 'Currently below nisab, so zakat due is 0.'}
          </p>
        </div>

        <Button type="button" className="ios-primary-action mt-2.5 w-full" onClick={onSaveAssessment} loading={isSaving} loadingText="Saving...">
          <HugeiconsIcon icon={Tick01Icon} strokeWidth={2.1} className="mr-2 h-4 w-4" />
          Save assessment
        </Button>
      </CardContent>
    </Card>
  )
}

export function HistoryCard({ history, currency }: { history: AssessmentSnapshot[]; currency: string }) {
  return (
    <Card className="ios-surface">
      <CardHeader>
        <CardTitle className="ios-section-title">Previous assessments</CardTitle>
        <p className="ios-copy-muted">Saved snapshots in reverse chronological order.</p>
      </CardHeader>
      <CardContent className="space-y-2">
        {history.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-white/70 px-4 py-4 text-sm text-slate-500">
            No saved assessments yet. Tap “Save assessment” to keep this result.
          </div>
        ) : (
          history.map((snapshot) => (
            <div key={snapshot.id} className="rounded-2xl border border-white/80 bg-white/85 p-3">
              <div className="mb-2 flex items-center justify-between gap-2">
                <p className="text-xs font-semibold tracking-[0.12em] text-slate-500">{formatAssessmentDate(snapshot.assessmentAt)}</p>
                <span
                  className={
                    snapshot.nisabState === 'ABOVE'
                      ? 'rounded-full bg-emerald-50 px-2 py-1 text-[11px] font-semibold text-emerald-700'
                      : 'rounded-full bg-slate-100 px-2 py-1 text-[11px] font-semibold text-slate-600'
                  }
                >
                  {snapshot.nisabState === 'ABOVE' ? 'Above nisab' : 'Below nisab'}
                </span>
              </div>

              <div className="space-y-1.5 text-sm">
                <SummaryRow label="Assets" value={formatFromStored(snapshot.totalAssets, currency)} />
                <SummaryRow label="Liabilities" value={formatFromStored(snapshot.totalLiabilities, currency)} />
                <SummaryRow label="Net zakatable wealth" value={formatFromStored(snapshot.netWorth, currency)} />
                <SummaryRow label="Nisab value" value={formatFromStored(snapshot.nisabValue, currency)} />
                <SummaryRow label="Zakat due" value={formatFromStored(snapshot.zakatDue, currency)} />
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  )
}

export function WizardPager({
  step,
  setStep,
}: {
  step: WizardStep
  setStep: (step: WizardStep) => void
}) {
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

export function MoneyField({
  label,
  value,
  helperText,
  onChange,
}: {
  label: string
  value: string
  helperText: string
  onChange: (value: string) => void
}) {
  return (
    <div className="grid gap-1.5">
      <Label>{label}</Label>
      <Input className="ios-input" inputMode="decimal" placeholder="0.00" value={value} onChange={(event) => onChange(event.target.value)} />
      <p className="text-[11px] leading-4 text-slate-500">{helperText}</p>
    </div>
  )
}

export function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-white/70 bg-white/70 px-3 py-2">
      <span className="text-slate-600">{label}</span>
      <span className="font-medium text-slate-900">{value}</span>
    </div>
  )
}
