import { createFileRoute, redirect } from '@tanstack/react-router'
import { IosAppShell } from '@/components/layout/ios-app-shell'
import { HistoryCard } from '@/features/zakat/components/zakat-calculator-components'
import { getAssessmentHistory } from '@/features/zakat/model/assessment-history'
import { getPreferences } from '@/features/preferences/model/preferences'
import { authClient } from '@/lib/auth-client'

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
  const history = getAssessmentHistory()

  return (
    <IosAppShell title="Assessment history" subtitle="Saved zakat snapshots" activeTab="dashboard">
      <HistoryCard history={history} currency={currency} />
    </IosAppShell>
  )
}
