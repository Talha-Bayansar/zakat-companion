import { createFileRoute } from '@tanstack/react-router'
import { useMemo, useState } from 'react'
import { IosAppShell } from '@/components/layout/ios-app-shell'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { getPreferences } from '@/features/preferences/model/preferences'
import { calculateZakat, formatMoney, type ZakatCalculationInput } from '@/features/zakat/model/calculate-zakat'
import { m } from '@/paraglide/messages.js'

export const Route = createFileRoute('/dashboard/')({
  component: DashboardPage,
})

function DashboardPage() {
  const preferences = useMemo(() => getPreferences(), [])

  const [form, setForm] = useState<ZakatCalculationInput>({
    cash: '',
    gold: '',
    silver: '',
    investments: '',
    businessAssets: '',
    receivables: '',
    debtsDue: '',
    otherLiabilities: '',
    nisab: '5500',
  })

  const result = useMemo(() => calculateZakat(form), [form])

  const currency = preferences.currency || 'EUR'

  function updateField(name: keyof ZakatCalculationInput, value: string) {
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  return (
    <IosAppShell title={m.dashboard_title()} subtitle={m.dashboard_subtitle()} activeTab="dashboard">
      <Card className="ios-surface">
        <CardHeader>
          <CardTitle className="ios-section-title">Calculate your zakat</CardTitle>
          <p className="ios-copy-muted">Enter your current assets and liabilities. We’ll calculate 2.5% when your net worth reaches nisab.</p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <MoneyField label="Cash" value={form.cash} onChange={(value) => updateField('cash', value)} />
            <MoneyField label="Gold value" value={form.gold} onChange={(value) => updateField('gold', value)} />
            <MoneyField label="Silver value" value={form.silver} onChange={(value) => updateField('silver', value)} />
            <MoneyField label="Investments" value={form.investments} onChange={(value) => updateField('investments', value)} />
            <MoneyField label="Business assets" value={form.businessAssets} onChange={(value) => updateField('businessAssets', value)} />
            <MoneyField label="Receivables" value={form.receivables} onChange={(value) => updateField('receivables', value)} />
          </div>

          <div className="rounded-2xl border border-white/70 bg-white/70 p-3">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Liabilities</p>
            <div className="mt-3 grid grid-cols-2 gap-3">
              <MoneyField label="Debts due now" value={form.debtsDue} onChange={(value) => updateField('debtsDue', value)} />
              <MoneyField label="Other liabilities" value={form.otherLiabilities} onChange={(value) => updateField('otherLiabilities', value)} />
            </div>
          </div>

          <MoneyField label="Nisab threshold" value={form.nisab} onChange={(value) => updateField('nisab', value)} />

          <div className="grid grid-cols-2 gap-3">
            <Button type="button" className="ios-secondary-action" onClick={() => updateField('nisab', '5500')}>
              Use gold nisab
            </Button>
            <Button type="button" className="ios-secondary-action" onClick={() => updateField('nisab', '450')}>
              Use silver nisab
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="ios-surface">
        <CardHeader>
          <CardTitle className="ios-section-title">Assessment</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <SummaryRow label="Total assets" value={formatMoney(result.totalAssets, currency)} />
          <SummaryRow label="Total liabilities" value={formatMoney(result.totalLiabilities, currency)} />
          <SummaryRow label="Net zakatable wealth" value={formatMoney(result.netWorth, currency)} />
          <SummaryRow label="Nisab" value={formatMoney(result.nisab, currency)} />

          <div className="mt-2 rounded-2xl border border-slate-200/80 bg-white/80 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Zakat due</p>
            <p className="mt-2 text-2xl font-semibold text-slate-900">{formatMoney(result.zakatDue, currency)}</p>
            <p className="mt-1 text-sm text-slate-600">
              {result.isEligible
                ? 'You are above nisab. 2.5% is applied to your net zakatable wealth.'
                : 'You are below nisab right now, so zakat due is 0.'}
            </p>
          </div>
        </CardContent>
      </Card>
    </IosAppShell>
  )
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
      <Input
        className="ios-input"
        inputMode="decimal"
        placeholder="0.00"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
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
