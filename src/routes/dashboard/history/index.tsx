import { Link, createFileRoute } from '@tanstack/react-router'
import { IosAppShell } from '@/components/layout/ios-app-shell'
import { InfiniteScrollSentinel } from '@/components/shared/infinite-scroll-sentinel'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Spinner } from '@/components/ui/spinner'
import { HistoryCard } from '@/features/zakat/components/history-card'
import { useCurrentUserQuery } from '@/features/auth/api/use-current-user-query'
import { AuthWrapper } from '@/features/auth/components/auth-wrapper'
import { useAssessmentHistoryInfiniteQuery } from '@/features/zakat/api/use-assessment-history-infinite-query'
import { useLifecycleOverviewQuery } from '@/features/zakat/api/use-lifecycle-overview-query'
import { mapAssessmentHistoryRowToSnapshot } from '@/features/zakat/model/map-assessment-history-row'
import { getPreferences } from '@/features/preferences/model/preferences'
import { m } from '@/paraglide/messages.js'

export const Route = createFileRoute('/dashboard/history/')({
  component: DashboardHistoryPage,
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

function timelineLabel(type: string) {
  if (type === 'state_above') return 'Moved above nisab'
  if (type === 'state_below') return 'Moved below nisab'
  if (type === 'cycle_start') return 'Cycle started'
  if (type === 'cycle_end') return 'Cycle ended'
  return type
}

function DashboardHistoryPage() {
  const preferences = getPreferences()
  const currency = preferences.currency || 'EUR'

  const { data: currentUser } = useCurrentUserQuery()
  const userId = currentUser?.id
  const historyQuery = useAssessmentHistoryInfiniteQuery(userId)
  const lifecycleQuery = useLifecycleOverviewQuery(userId)

  const history = (historyQuery.data?.pages.flatMap((page) => page.items) ?? []).map(mapAssessmentHistoryRowToSnapshot)
  const timeline = lifecycleQuery.data?.timeline ?? []

  return (
    <AuthWrapper>
      <IosAppShell title={m.history_title()} subtitle={m.history_subtitle()} activeTab="dashboard">
      <Link to="/dashboard" className="ios-secondary-action w-full">← {m.back_to_dashboard()}</Link>
      <HistoryCard history={history} currency={currency} />

      <Card className="ios-surface">
        <CardHeader>
          <CardTitle className="ios-section-title">Lifecycle transitions timeline</CardTitle>
        </CardHeader>
        <CardContent>
          {timeline.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-white/70 px-4 py-4 text-sm text-slate-500">
              No lifecycle transitions yet.
            </div>
          ) : (
            <div className="rounded-2xl border border-white/80 bg-white/85 px-3 divide-y divide-slate-200/70">
              {timeline.map((event) => (
                <div key={event.id} className="py-3">
                  <p className="text-sm font-semibold text-slate-900">{timelineLabel(event.type)}</p>
                  <p className="text-xs text-slate-500">{formatDateTime(event.eventAt)}</p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {historyQuery.isLoading ? (
        <div className="ios-surface flex items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm text-slate-500">
          <Spinner /> {m.history_loading()}
        </div>
      ) : historyQuery.hasNextPage ? (
        <>
          <InfiniteScrollSentinel onIntersect={() => historyQuery.fetchNextPage()} disabled={historyQuery.isFetchingNextPage} />
          {historyQuery.isFetchingNextPage ? (
            <div className="ios-surface flex items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm text-slate-500">
              <Spinner /> {m.history_loading_more()}
            </div>
          ) : null}
        </>
      ) : (
        <p className="text-center text-xs text-slate-500">{m.history_end_reached()}</p>
      )}
      </IosAppShell>
    </AuthWrapper>
  )
}
