import { Link, createFileRoute, redirect } from '@tanstack/react-router'
import { IosAppShell } from '@/components/layout/ios-app-shell'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Spinner } from '@/components/ui/spinner'
import { SummaryRow } from '@/features/zakat/components/summary-row'
import { formatAssessmentDate, formatFromStored } from '@/features/zakat/components/zakat-formatters'
import { useCurrentUserQuery } from '@/features/auth/api/use-current-user-query'
import { useAssessmentByIdQuery } from '@/features/zakat/api/use-assessment-by-id-query'
import { getPreferences } from '@/features/preferences/model/preferences'
import { authClient } from '@/lib/auth-client'
import { m } from '@/paraglide/messages.js'

export const Route = createFileRoute('/dashboard/history/$assessmentId/')({
  beforeLoad: async () => {
    const session = await authClient.getSession()
    if (!session.data) throw redirect({ to: '/auth/sign-in' })
  },
  component: AssessmentDetailPage,
})

function AssessmentDetailPage() {
  const { assessmentId } = Route.useParams()
  const preferences = getPreferences()
  const currency = preferences.currency || 'EUR'

  const { data: user } = useCurrentUserQuery()
  const detailQuery = useAssessmentByIdQuery({ userId: user?.id, assessmentId })

  const row = detailQuery.data

  return (
    <IosAppShell title={m.history_detail_title()} subtitle={m.history_detail_subtitle()} activeTab="dashboard">
      <Link to="/dashboard/history" className="ios-secondary-action w-full">← {m.back_to_history()}</Link>

      {detailQuery.isLoading ? (
        <div className="ios-surface flex items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm text-slate-500">
          <Spinner /> {m.history_loading()}
        </div>
      ) : !row ? (
        <div className="ios-surface rounded-2xl px-4 py-3 text-sm text-slate-500">{m.history_detail_not_found()}</div>
      ) : (
        <Card className="ios-surface">
          <CardHeader>
            <CardTitle className="ios-section-title">{formatAssessmentDate(row.assessmentAt.toISOString())}</CardTitle>
            <p className="ios-copy-muted">{row.nisabState === 'ABOVE' ? m.nisab_state_above() : m.nisab_state_below()}</p>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <SummaryRow label={m.zakat_label_assets()} value={formatFromStored(row.totalAssets, currency)} />
            <SummaryRow label={m.zakat_label_liabilities()} value={formatFromStored(row.totalLiabilities, currency)} />
            <SummaryRow label={m.zakat_label_net_wealth()} value={formatFromStored(row.netZakatableWealth, currency)} />
            <SummaryRow label={m.zakat_label_nisab_value()} value={formatFromStored(row.nisabValue, currency)} />
            <SummaryRow label={m.zakat_label_due()} value={formatFromStored(row.zakatDueNow, currency)} />
          </CardContent>
        </Card>
      )}
    </IosAppShell>
  )
}
