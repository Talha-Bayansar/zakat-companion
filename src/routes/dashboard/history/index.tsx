import { createFileRoute, redirect } from '@tanstack/react-router'
import { IosAppShell } from '@/components/layout/ios-app-shell'
import { InfiniteScrollSentinel } from '@/components/shared/infinite-scroll-sentinel'
import { Spinner } from '@/components/ui/spinner'
import { HistoryCard } from '@/features/zakat/components/history-card'
import { useCurrentUserQuery } from '@/features/auth/api/use-current-user-query'
import { useAssessmentHistoryInfiniteQuery } from '@/features/zakat/api/use-assessment-history-infinite-query'
import { mapAssessmentHistoryRowToSnapshot } from '@/features/zakat/model/map-assessment-history-row'
import { getPreferences } from '@/features/preferences/model/preferences'
import { authClient } from '@/lib/auth-client'
import { m } from '@/paraglide/messages.js'

export const Route = createFileRoute('/dashboard/history/')({
  beforeLoad: async () => {
    const session = await authClient.getSession()
    if (!session.data) throw redirect({ to: '/auth/sign-in' })
  },
  component: DashboardHistoryPage,
})

function DashboardHistoryPage() {
  const preferences = getPreferences()
  const currency = preferences.currency || 'EUR'

  const { data: currentUser } = useCurrentUserQuery()
  const userId = currentUser?.id
  const historyQuery = useAssessmentHistoryInfiniteQuery(userId)

  const history = (historyQuery.data?.pages.flatMap((page) => page.items) ?? []).map(mapAssessmentHistoryRowToSnapshot)

  return (
    <IosAppShell title={m.history_title()} subtitle={m.history_subtitle()} activeTab="dashboard">
      <HistoryCard history={history} currency={currency} />

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
  )
}
