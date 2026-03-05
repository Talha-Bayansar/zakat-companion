import { Link, createFileRoute, redirect } from '@tanstack/react-router'
import { HugeiconsIcon } from '@hugeicons/react'
import { ArrowRight01Icon } from '@hugeicons/core-free-icons'
import { IosAppShell } from '@/components/layout/ios-app-shell'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { SummaryRow } from '@/features/zakat/components/zakat-calculator-components'
import { getPreferences } from '@/features/preferences/model/preferences'
import { calculateZakat, formatMoney } from '@/features/zakat/model/calculate-zakat'
import { getFinancialValues } from '@/features/zakat/model/financial-values'
import { m } from '@/paraglide/messages.js'
import { authClient } from '@/lib/auth-client'

export const Route = createFileRoute('/dashboard/')({
  beforeLoad: async () => {
    const session = await authClient.getSession()
    if (!session.data) throw redirect({ to: '/auth/sign-in' })
  },
  component: DashboardPage,
})

function DashboardPage() {
  const preferences = getPreferences()
  const values = getFinancialValues()
  const currency = preferences.currency || 'EUR'

  const result = calculateZakat({
    cash: values.cash,
    gold: values.gold,
    silver: values.silver,
    investments: values.investments,
    businessAssets: values.businessAssets,
    receivables: values.receivables,
    debtsDue: values.debtsDue,
    otherLiabilities: values.otherLiabilities,
    nisab: values.nisab,
  })

  return (
    <IosAppShell title={m.dashboard_title()} subtitle="Overview" activeTab="dashboard">
      <Card className="ios-surface">
        <CardHeader>
          <CardTitle className="ios-section-title">Quick summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <SummaryRow label="Net zakatable wealth" value={formatMoney(result.netWorth, currency)} />
          <SummaryRow label="Nisab" value={formatMoney(result.nisab, currency)} />
          <SummaryRow label="Zakat due" value={formatMoney(result.zakatDue, currency)} />
          <SummaryRow label="Status" value={result.isEligible ? 'Above nisab' : 'Below nisab'} />
        </CardContent>
      </Card>

      <Card className="ios-surface">
        <CardHeader>
          <CardTitle className="ios-section-title">Actions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2.5">
          <Link to="/dashboard/calculator" className="ios-secondary-action w-full justify-between">
            <span>Open zakat calculator</span>
            <HugeiconsIcon icon={ArrowRight01Icon} strokeWidth={2.2} className="h-5 w-5 text-slate-500" aria-hidden />
          </Link>
          <Link to="/dashboard/history" className="ios-secondary-action w-full justify-between">
            <span>Open assessment history</span>
            <HugeiconsIcon icon={ArrowRight01Icon} strokeWidth={2.2} className="h-5 w-5 text-slate-500" aria-hidden />
          </Link>
        </CardContent>
      </Card>
    </IosAppShell>
  )
}
