import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { AssessmentSnapshot } from '@/features/zakat/model/assessment-history'
import { formatAssessmentDate, formatFromStored } from './zakat-formatters'
import { SummaryRow } from './summary-row'

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
