import { createFileRoute, redirect } from '@tanstack/react-router'
import { useEffect, useMemo, useState } from 'react'
import { IosAppShell } from '@/components/layout/ios-app-shell'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { MoneyField } from '@/features/zakat/components/money-field'
import { ResultCard } from '@/features/zakat/components/result-card'
import { StepIndicator } from '@/features/zakat/components/step-indicator'
import { WizardPager } from '@/features/zakat/components/wizard-pager'
import { WizardSection } from '@/features/zakat/components/wizard-section'
import type { WizardStep } from '@/features/zakat/components/wizard-step'
import { formatLastUpdated } from '@/features/zakat/components/zakat-formatters'
import { getPreferences } from '@/features/preferences/model/preferences'
import { useCurrentUserQuery } from '@/features/auth/api/use-current-user-query'
import { useAssessmentHistoryInfiniteQuery } from '@/features/zakat/api/use-assessment-history-infinite-query'
import { useSaveAssessmentMutation } from '@/features/zakat/api/use-save-assessment-mutation'
import { calculateZakat, formatMoney, type ZakatCalculationInput } from '@/features/zakat/model/calculate-zakat'
import {
  defaultFinancialValues,
  getFinancialValues,
  saveFinancialValues,
  type EditableFinancialField,
  type StoredFinancialValues,
} from '@/features/zakat/model/financial-values'
import { m } from '@/paraglide/messages.js'
import { authClient } from '@/lib/auth-client'
import { mapAssessmentHistoryRowToSnapshot } from '@/features/zakat/model/map-assessment-history-row'
import { toast } from 'sonner'

export const Route = createFileRoute('/dashboard/calculator/')({
  beforeLoad: async () => {
    const session = await authClient.getSession()
    if (!session.data) throw redirect({ to: '/auth/sign-in' })
  },
  component: CalculatorPage,
})

function CalculatorPage() {
  const preferences = useMemo(() => getPreferences(), [])
  const [step, setStep] = useState<WizardStep>(1)
  const [form, setForm] = useState<StoredFinancialValues>(() => getFinancialValues())
  const [didHydrate, setDidHydrate] = useState(false)

  const { data: currentUser } = useCurrentUserQuery()
  const userId = currentUser?.id
  const historyQuery = useAssessmentHistoryInfiniteQuery(userId)
  const saveAssessmentMutation = useSaveAssessmentMutation(userId)

  const result = useMemo(() => {
    const { lastUpdatedAt: _lastUpdatedAt, ...calculationValues } = form
    return calculateZakat(calculationValues as ZakatCalculationInput)
  }, [form])

  const currency = preferences.currency || 'EUR'

  useEffect(() => {
    if (didHydrate) return
    const firstRow = historyQuery.data?.pages[0]?.items[0]
    if (!firstRow) return

    const latest = mapAssessmentHistoryRowToSnapshot(firstRow)
    const nextForm: StoredFinancialValues = {
      cash: latest.inputs.cash,
      gold: latest.inputs.gold,
      silver: latest.inputs.silver,
      investments: latest.inputs.investments,
      businessAssets: latest.inputs.businessAssets,
      receivables: latest.inputs.receivables,
      debtsDue: latest.inputs.debtsDue,
      otherLiabilities: latest.inputs.otherLiabilities,
      nisab: latest.inputs.nisab,
      lastUpdatedAt: latest.assessmentAt,
    }

    setForm(nextForm)
    saveFinancialValues(nextForm)
    setDidHydrate(true)
  }, [didHydrate, historyQuery.data])

  function updateField(name: EditableFinancialField, value: string) {
    const next = { ...form, [name]: value, lastUpdatedAt: new Date().toISOString() }
    setForm(next)
    saveFinancialValues(next)
  }

  function resetAll() {
    setForm(defaultFinancialValues)
    saveFinancialValues(defaultFinancialValues)
    setStep(1)
  }

  async function saveAssessment() {
    if (!userId) {
      toast.error('Session not ready. Please refresh and try again.')
      return
    }

    try {
      await saveAssessmentMutation.mutateAsync({
        userId,
        values: {
          cash: form.cash,
          gold: form.gold,
          silver: form.silver,
          investments: form.investments,
          businessAssets: form.businessAssets,
          receivables: form.receivables,
          debtsDue: form.debtsDue,
          otherLiabilities: form.otherLiabilities,
          nisab: form.nisab,
        },
      })

      toast.success('Assessment saved')
    } catch {
      toast.error('Failed to save assessment on server')
    }
  }

  return (
    <IosAppShell title="Calculator" subtitle={m.dashboard_subtitle()} activeTab="dashboard">
      <ResultCard
        currency={currency}
        totalAssets={formatMoney(result.totalAssets, currency)}
        totalLiabilities={formatMoney(result.totalLiabilities, currency)}
        netWorth={formatMoney(result.netWorth, currency)}
        nisab={formatMoney(result.nisab, currency)}
        zakatDue={formatMoney(result.zakatDue, currency)}
        isEligible={result.isEligible}
        isSaving={saveAssessmentMutation.isPending}
        onSaveAssessment={saveAssessment}
      />

      <Card className="ios-surface">
        <CardHeader>
          <CardTitle className="ios-section-title">{m.dashboard_wizard_title()}</CardTitle>
          <p className="ios-copy-muted">{m.dashboard_wizard_subtitle()}</p>
          <p className="text-xs font-medium tracking-[0.08em] text-slate-500">{formatLastUpdated(form.lastUpdatedAt)}</p>
        </CardHeader>
        <CardContent className="space-y-3">
          <StepIndicator step={step} />

          {step === 1 ? (
            <WizardSection title={m.dashboard_wizard_step1_title()} hint={m.dashboard_wizard_step1_hint()}>
              <div className="grid grid-cols-2 gap-2.5">
                <MoneyField label="Cash" value={form.cash} helperText={m.dashboard_wizard_field_cash_guide()} onChange={(v) => updateField('cash', v)} />
                <MoneyField label="Gold value" value={form.gold} helperText={m.dashboard_wizard_field_gold_guide()} onChange={(v) => updateField('gold', v)} />
                <MoneyField label="Silver value" value={form.silver} helperText={m.dashboard_wizard_field_silver_guide()} onChange={(v) => updateField('silver', v)} />
                <MoneyField label="Investments" value={form.investments} helperText={m.dashboard_wizard_field_investments_guide()} onChange={(v) => updateField('investments', v)} />
              </div>
            </WizardSection>
          ) : null}

          {step === 2 ? (
            <WizardSection title={m.dashboard_wizard_step2_title()} hint={m.dashboard_wizard_step2_hint()}>
              <div className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900">{m.dashboard_wizard_step2_due_now_guide()}</div>
              <div className="grid grid-cols-2 gap-2.5">
                <MoneyField label="Business assets" value={form.businessAssets} helperText={m.dashboard_wizard_field_business_assets_guide()} onChange={(v) => updateField('businessAssets', v)} />
                <MoneyField label="Receivables" value={form.receivables} helperText={m.dashboard_wizard_field_receivables_guide()} onChange={(v) => updateField('receivables', v)} />
                <MoneyField label="Debts due now" value={form.debtsDue} helperText={m.dashboard_wizard_field_debts_due_guide()} onChange={(v) => updateField('debtsDue', v)} />
                <MoneyField label="Other liabilities" value={form.otherLiabilities} helperText={m.dashboard_wizard_field_other_liabilities_guide()} onChange={(v) => updateField('otherLiabilities', v)} />
              </div>
            </WizardSection>
          ) : null}

          {step === 3 ? (
            <WizardSection title={m.dashboard_wizard_step3_title()} hint={m.dashboard_wizard_step3_hint()}>
              <MoneyField label="Nisab threshold" value={form.nisab} helperText={m.dashboard_wizard_field_nisab_guide()} onChange={(v) => updateField('nisab', v)} />
              <div className="grid grid-cols-2 gap-2.5">
                <Button type="button" className="ios-secondary-action" onClick={() => updateField('nisab', '5500')}>Gold nisab preset</Button>
                <Button type="button" className="ios-secondary-action" onClick={() => updateField('nisab', '450')}>Silver nisab preset</Button>
              </div>
            </WizardSection>
          ) : null}

          <WizardPager step={step} setStep={setStep} />

          <Button type="button" className="ios-secondary-action w-full" onClick={resetAll}>
            Clear all saved values
          </Button>
        </CardContent>
      </Card>
    </IosAppShell>
  )
}
