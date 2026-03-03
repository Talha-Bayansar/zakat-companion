import { createFileRoute } from '@tanstack/react-router'
import Decimal from 'decimal.js'
import { HugeiconsIcon } from '@hugeicons/react'
import { ArrowLeft01Icon, ArrowRight01Icon, Tick01Icon } from '@hugeicons/core-free-icons'
import { type ReactNode, useMemo, useState } from 'react'
import { IosAppShell } from '@/components/layout/ios-app-shell'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { getPreferences } from '@/features/preferences/model/preferences'
import { calculateZakat, formatMoney, type ZakatCalculationInput } from '@/features/zakat/model/calculate-zakat'
import {
  defaultFinancialValues,
  getFinancialValues,
  saveFinancialValues,
  type StoredFinancialValues,
} from '@/features/zakat/model/financial-values'
import {
  createAssessmentSnapshot,
  getAssessmentHistory,
  saveAssessmentSnapshot,
  type AssessmentSnapshot,
} from '@/features/zakat/model/assessment-history'
import { m } from '@/paraglide/messages.js'

export const Route = createFileRoute('/dashboard/')({
  component: DashboardPage,
})

type WizardStep = 1 | 2 | 3

function DashboardPage() {
  const preferences = useMemo(() => getPreferences(), [])
  const [step, setStep] = useState<WizardStep>(1)
  const [form, setForm] = useState<StoredFinancialValues>(() => getFinancialValues())
  const [history, setHistory] = useState<AssessmentSnapshot[]>(() => getAssessmentHistory())

  const result = useMemo(() => calculateZakat(form as ZakatCalculationInput), [form])
  const currency = preferences.currency || 'EUR'

  function updateField(name: keyof StoredFinancialValues, value: string) {
    const next = { ...form, [name]: value }
    setForm(next)
    saveFinancialValues(next)
  }

  function resetAll() {
    setForm(defaultFinancialValues)
    saveFinancialValues(defaultFinancialValues)
    setStep(1)
  }

  function saveAssessment() {
    const snapshot = createAssessmentSnapshot({
      values: form,
      result,
    })

    saveAssessmentSnapshot(snapshot)
    setHistory(getAssessmentHistory())
  }

  return (
    <IosAppShell title={m.dashboard_title()} subtitle={m.dashboard_subtitle()} activeTab="dashboard">
      <ResultCard
        currency={currency}
        totalAssets={formatMoney(result.totalAssets, currency)}
        totalLiabilities={formatMoney(result.totalLiabilities, currency)}
        netWorth={formatMoney(result.netWorth, currency)}
        nisab={formatMoney(result.nisab, currency)}
        zakatDue={formatMoney(result.zakatDue, currency)}
        isEligible={result.isEligible}
        onSaveAssessment={saveAssessment}
      />

      <Card className="ios-surface">
        <CardHeader>
          <CardTitle className="ios-section-title">Zakat wizard</CardTitle>
          <p className="ios-copy-muted">Compact step-by-step input. We save your numbers automatically so you only edit changed fields next time.</p>
        </CardHeader>
        <CardContent className="space-y-4">
          <StepIndicator step={step} />

          {step === 1 ? (
            <WizardSection
              title="Step 1: Liquid assets"
              hint="Use current market value in your selected currency. You can enter decimals like 1250.50"
            >
              <div className="grid grid-cols-2 gap-3">
                <MoneyField label="Cash" value={form.cash} onChange={(value) => updateField('cash', value)} />
                <MoneyField label="Gold value" value={form.gold} onChange={(value) => updateField('gold', value)} />
                <MoneyField label="Silver value" value={form.silver} onChange={(value) => updateField('silver', value)} />
                <MoneyField label="Investments" value={form.investments} onChange={(value) => updateField('investments', value)} />
              </div>
            </WizardSection>
          ) : null}

          {step === 2 ? (
            <WizardSection
              title="Step 2: Business + liabilities"
              hint="Only include liabilities currently due. Long-term future debt is usually excluded in standard method."
            >
              <div className="grid grid-cols-2 gap-3">
                <MoneyField
                  label="Business assets"
                  value={form.businessAssets}
                  onChange={(value) => updateField('businessAssets', value)}
                />
                <MoneyField label="Receivables" value={form.receivables} onChange={(value) => updateField('receivables', value)} />
                <MoneyField label="Debts due now" value={form.debtsDue} onChange={(value) => updateField('debtsDue', value)} />
                <MoneyField
                  label="Other liabilities"
                  value={form.otherLiabilities}
                  onChange={(value) => updateField('otherLiabilities', value)}
                />
              </div>
            </WizardSection>
          ) : null}

          {step === 3 ? (
            <WizardSection
              title="Step 3: Nisab check"
              hint="Use a nisab amount from your trusted local source. Quick presets below are simple defaults."
            >
              <MoneyField label="Nisab threshold" value={form.nisab} onChange={(value) => updateField('nisab', value)} />

              <div className="grid grid-cols-2 gap-3">
                <Button type="button" className="ios-secondary-action" onClick={() => updateField('nisab', '5500')}>
                  Gold nisab preset
                </Button>
                <Button type="button" className="ios-secondary-action" onClick={() => updateField('nisab', '450')}>
                  Silver nisab preset
                </Button>
              </div>
            </WizardSection>
          ) : null}

          <div className="flex items-center justify-between rounded-2xl border border-white/70 bg-white/70 p-2">
            <Button
              type="button"
              aria-label="Go to previous wizard step"
              className="h-11 w-11 rounded-xl border border-slate-200 bg-white text-slate-800 shadow-none"
              onClick={() => setStep((prev) => Math.max(1, prev - 1) as WizardStep)}
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
                onClick={() => setStep((prev) => Math.min(3, prev + 1) as WizardStep)}
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

          <Button type="button" className="ios-secondary-action w-full" onClick={resetAll}>
            Clear all saved values
          </Button>
        </CardContent>
      </Card>

      <HistoryCard history={history} currency={currency} />
    </IosAppShell>
  )
}

function WizardSection({
  title,
  hint,
  children,
}: {
  title: string
  hint: string
  children: ReactNode
}) {
  return (
    <section className="space-y-3 rounded-2xl border border-white/70 bg-white/70 p-3">
      <div>
        <p className="text-sm font-semibold text-slate-900">{title}</p>
        <p className="mt-1 text-xs text-slate-600">{hint}</p>
      </div>
      {children}
    </section>
  )
}

function StepIndicator({ step }: { step: WizardStep }) {
  const steps: Array<{ id: WizardStep; label: string }> = [
    { id: 1, label: 'Assets' },
    { id: 2, label: 'Liabilities' },
    { id: 3, label: 'Nisab' },
  ]

  return (
    <div className="grid grid-cols-3 gap-2">
      {steps.map((item) => {
        const active = step === item.id
        const done = step > item.id

        return (
          <div
            key={item.id}
            className={active || done ? 'rounded-xl bg-slate-900 px-3 py-2 text-center text-xs font-medium text-white' : 'rounded-xl bg-slate-100 px-3 py-2 text-center text-xs font-medium text-slate-500'}
          >
            {item.id}. {item.label}
          </div>
        )
      })}
    </div>
  )
}

function ResultCard({
  currency,
  totalAssets,
  totalLiabilities,
  netWorth,
  nisab,
  zakatDue,
  isEligible,
  onSaveAssessment,
}: {
  currency: string
  totalAssets: string
  totalLiabilities: string
  netWorth: string
  nisab: string
  zakatDue: string
  isEligible: boolean
  onSaveAssessment: () => void
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

        <div className="mt-2 rounded-2xl border border-slate-200/80 bg-white/80 p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Zakat due</p>
          <p className="mt-2 text-2xl font-semibold text-slate-900">{zakatDue}</p>
          <p className="mt-1 text-sm text-slate-600">
            {isEligible
              ? 'You are above nisab. Zakat due is 2.5% of your net zakatable wealth.'
              : 'Currently below nisab, so zakat due is 0.'}
          </p>
        </div>

        <Button type="button" className="ios-primary-action mt-3 w-full" onClick={onSaveAssessment}>
          <HugeiconsIcon icon={Tick01Icon} strokeWidth={2.1} className="mr-2 h-4 w-4" />
          Save assessment
        </Button>
      </CardContent>
    </Card>
  )
}

function HistoryCard({
  history,
  currency,
}: {
  history: AssessmentSnapshot[]
  currency: string
}) {
  return (
    <Card className="ios-surface">
      <CardHeader>
        <CardTitle className="ios-section-title">Previous assessments</CardTitle>
        <p className="ios-copy-muted">Saved snapshots in reverse chronological order.</p>
      </CardHeader>
      <CardContent className="space-y-2">
        {history.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-white/70 px-4 py-5 text-sm text-slate-500">
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

function formatFromStored(amount: string, currency: string) {
  try {
    return formatMoney(new Decimal(amount), currency)
  } catch {
    return formatMoney(new Decimal(0), currency)
  }
}

function formatAssessmentDate(value: string) {
  const date = new Date(value)

  if (Number.isNaN(date.getTime())) return 'Unknown date'

  return new Intl.DateTimeFormat(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}

function MoneyField({
  label,
  value,
  onChange,
}: {
  label: string
  value: string
  onChange: (value: string) => void
}) {
  return (
    <div className="grid gap-2">
      <Label>{label}</Label>
      <Input className="ios-input" inputMode="decimal" placeholder="0.00" value={value} onChange={(event) => onChange(event.target.value)} />
    </div>
  )
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-white/70 bg-white/70 px-3 py-2">
      <span className="text-slate-600">{label}</span>
      <span className="font-medium text-slate-900">{value}</span>
    </div>
  )
}
