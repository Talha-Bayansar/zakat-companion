import { Link, createFileRoute } from '@tanstack/react-router'
import { HugeiconsIcon } from '@hugeicons/react'
import { ArrowRight01Icon } from '@hugeicons/core-free-icons'
import { IosAppShell } from '@/components/layout/ios-app-shell'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { SummaryRow } from '@/features/zakat/components/summary-row'
import { useCurrentUserQuery } from '@/features/auth/api/use-current-user-query'
import { AuthWrapper } from '@/features/auth/components/auth-wrapper'
import { useAssessmentHistoryInfiniteQuery } from '@/features/zakat/api/use-assessment-history-infinite-query'
import { useLifecycleOverviewQuery } from '@/features/zakat/api/use-lifecycle-overview-query'
import { mapAssessmentHistoryRowToSnapshot } from '@/features/zakat/model/map-assessment-history-row'
import { getPreferences } from '@/features/preferences/model/preferences'
import { calculateZakat, formatMoney } from '@/features/zakat/model/calculate-zakat'
import { getFinancialValues } from '@/features/zakat/model/financial-values'
import { m } from '@/paraglide/messages.js'
import { getLocale } from '@/paraglide/runtime.js'

export const Route = createFileRoute('/dashboard/')({
  component: DashboardPage,
})

function formatDateTime(value?: string | Date | null) {
  if (!value) return '—'
  const date = typeof value === 'string' ? new Date(value) : value
  if (Number.isNaN(date.getTime())) return '—'

  return new Intl.DateTimeFormat(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date)
}

function tLifecycleDashboard(locale: string) {
  if (locale === 'tr') {
    return {
      title: 'Döngü',
      currentState: 'Güncel nisab durumu',
      activeCycle: 'Aktif döngü',
      running: 'Devam ediyor',
      notActive: 'Aktif değil',
      nextDue: 'Sonraki vade tarihi',
    }
  }

  if (locale === 'nl') {
    return {
      title: 'Cyclus',
      currentState: 'Huidige nisab-status',
      activeCycle: 'Actieve cyclus',
      running: 'Actief',
      notActive: 'Niet actief',
      nextDue: 'Volgende vervaldatum',
    }
  }

  return {
    title: 'Lifecycle',
    currentState: 'Current nisab state',
    activeCycle: 'Active cycle',
    running: 'Running',
    notActive: 'Not active',
    nextDue: 'Next due date',
  }
}

function DashboardPage() {
  const preferences = getPreferences()
  const values = getFinancialValues()
  const currency = preferences.currency || 'EUR'

  const { data: currentUser } = useCurrentUserQuery()
  const historyQuery = useAssessmentHistoryInfiniteQuery(currentUser?.id)
  const lifecycleQuery = useLifecycleOverviewQuery(currentUser?.id)

  const firstRow = historyQuery.data?.pages[0]?.items[0]
  const latest = firstRow ? mapAssessmentHistoryRowToSnapshot(firstRow) : null

  const result = calculateZakat({
    cash: latest?.inputs.cash ?? values.cash,
    gold: latest?.inputs.gold ?? values.gold,
    silver: latest?.inputs.silver ?? values.silver,
    investments: latest?.inputs.investments ?? values.investments,
    businessAssets: latest?.inputs.businessAssets ?? values.businessAssets,
    receivables: latest?.inputs.receivables ?? values.receivables,
    debtsDue: latest?.inputs.debtsDue ?? values.debtsDue,
    otherLiabilities: latest?.inputs.otherLiabilities ?? values.otherLiabilities,
    nisab: latest?.inputs.nisab ?? values.nisab,
  })

  const userName = currentUser?.name?.trim() || m.onboarding_you()
  const lifecycle = lifecycleQuery.data
  const locale = getLocale()
  const lifecycleT = tLifecycleDashboard(locale)

  return (
    <AuthWrapper>
      <IosAppShell title={m.dashboard_title()} subtitle={`${m.dashboard_overview_subtitle()} · ${m.signed_in_as({ name: userName })}`} activeTab="dashboard">
      <Card className="ios-surface">
        <CardHeader>
          <CardTitle className="ios-section-title">{m.dashboard_quick_summary_title()}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <SummaryRow label={m.zakat_label_net_wealth()} value={formatMoney(result.netWorth, currency)} />
          <SummaryRow label={m.zakat_label_nisab()} value={formatMoney(result.nisab, currency)} />
          <SummaryRow label={m.zakat_label_due()} value={formatMoney(result.zakatDue, currency)} />
          <SummaryRow label={m.dashboard_status_label()} value={result.isEligible ? m.nisab_state_above() : m.nisab_state_below()} />
        </CardContent>
      </Card>

      <Card className="ios-surface">
        <CardHeader>
          <CardTitle className="ios-section-title">{lifecycleT.title}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <SummaryRow
            label={lifecycleT.currentState}
            value={(lifecycle?.currentNisabState ?? (result.isEligible ? 'ABOVE' : 'BELOW')) === 'ABOVE' ? m.nisab_state_above() : m.nisab_state_below()}
          />
          <SummaryRow label={lifecycleT.activeCycle} value={lifecycle?.hasActiveCycle ? lifecycleT.running : lifecycleT.notActive} />
          <SummaryRow label={lifecycleT.nextDue} value={formatDateTime(lifecycle?.activeCycle?.nextDueAt ?? null)} />
        </CardContent>
      </Card>

      <Card className="ios-surface">
        <CardHeader>
          <CardTitle className="ios-section-title">{m.dashboard_actions_title()}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2.5">
          <Link to="/dashboard/calculator" className="ios-secondary-action w-full justify-between">
            <span>{m.dashboard_open_calculator()}</span>
            <HugeiconsIcon icon={ArrowRight01Icon} strokeWidth={2.2} className="h-5 w-5 text-slate-500" aria-hidden />
          </Link>
          <Link to="/dashboard/history" className="ios-secondary-action w-full justify-between">
            <span>{m.dashboard_open_history()}</span>
            <HugeiconsIcon icon={ArrowRight01Icon} strokeWidth={2.2} className="h-5 w-5 text-slate-500" aria-hidden />
          </Link>
        </CardContent>
      </Card>
      </IosAppShell>
    </AuthWrapper>
  )
}
