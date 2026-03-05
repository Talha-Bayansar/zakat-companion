import { Link } from '@tanstack/react-router'
import { HugeiconsIcon } from '@hugeicons/react'
import { ArrowRight01Icon } from '@hugeicons/core-free-icons'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Item, ItemContent, ItemDescription, ItemTitle } from '@/components/ui/item'
import type { AssessmentSnapshot } from '@/features/zakat/model/assessment-history'
import { formatAssessmentDate, formatFromStored } from './zakat-formatters'
import { m } from '@/paraglide/messages.js'

export function HistoryCard({ history, currency }: { history: AssessmentSnapshot[]; currency: string }) {
  return (
    <Card className="ios-surface">
      <CardHeader>
        <CardTitle className="ios-section-title">{m.history_title()}</CardTitle>
        <p className="ios-copy-muted">{m.history_subtitle()}</p>
      </CardHeader>
      <CardContent>
        {history.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-white/70 px-4 py-4 text-sm text-slate-500">
            {m.history_empty()}
          </div>
        ) : (
          <div className="rounded-2xl border border-white/80 bg-white/85 px-3 divide-y divide-slate-200/70">
            {history.map((snapshot) => (
              <Link
                key={snapshot.id}
                to="/dashboard/history/$assessmentId"
                params={{ assessmentId: snapshot.id }}
                className="block"
              >
                <Item>
                  <ItemContent>
                    <ItemDescription className="font-semibold tracking-[0.08em] text-slate-500">
                      {formatAssessmentDate(snapshot.assessmentAt)}
                    </ItemDescription>
                    <ItemTitle>
                      {m.zakat_label_due()}: {formatFromStored(snapshot.zakatDue, currency)}
                    </ItemTitle>
                    <ItemDescription>
                      {snapshot.nisabState === 'ABOVE' ? m.nisab_state_above() : m.nisab_state_below()}
                    </ItemDescription>
                  </ItemContent>
                  <HugeiconsIcon icon={ArrowRight01Icon} strokeWidth={2.2} className="h-5 w-5 text-slate-500" aria-hidden />
                </Item>
              </Link>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
