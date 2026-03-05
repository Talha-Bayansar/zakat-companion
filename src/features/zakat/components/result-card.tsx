import { HugeiconsIcon } from '@hugeicons/react'
import { Tick01Icon } from '@hugeicons/core-free-icons'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { SummaryRow } from './summary-row'
import { m } from '@/paraglide/messages.js'

export function ResultCard({
  currency,
  totalAssets,
  totalLiabilities,
  netWorth,
  nisab,
  zakatDue,
  isEligible,
  isSaving,
  onSaveAssessment,
}: {
  currency: string
  totalAssets: string
  totalLiabilities: string
  netWorth: string
  nisab: string
  zakatDue: string
  isEligible: boolean
  isSaving: boolean
  onSaveAssessment: () => void | Promise<void>
}) {
  return (
    <Card className="ios-surface">
      <CardHeader>
        <CardTitle className="ios-section-title">{m.zakat_result_title()}</CardTitle>
        <p className="ios-copy-muted">{m.zakat_result_subtitle({ currency })}</p>
      </CardHeader>
      <CardContent className="space-y-2 text-sm">
        <SummaryRow label={m.zakat_label_total_assets()} value={totalAssets} />
        <SummaryRow label={m.zakat_label_total_liabilities()} value={totalLiabilities} />
        <SummaryRow label={m.zakat_label_net_wealth()} value={netWorth} />
        <SummaryRow label={m.zakat_label_nisab()} value={nisab} />

        <div className="mt-1.5 rounded-2xl border border-slate-200/80 bg-white/80 p-3.5">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">{m.zakat_label_due()}</p>
          <p className="mt-1.5 text-2xl font-semibold text-slate-900">{zakatDue}</p>
          <p className="mt-1 text-sm text-slate-600">
            {isEligible ? m.zakat_due_desc_above() : m.zakat_due_desc_below()}
          </p>
        </div>

        <Button type="button" className="ios-primary-action mt-2.5 w-full" onClick={onSaveAssessment} loading={isSaving} loadingText={m.zakat_action_saving()}>
          <HugeiconsIcon icon={Tick01Icon} strokeWidth={2.1} className="mr-2 h-4 w-4" />
          {m.zakat_action_save_assessment()}
        </Button>
      </CardContent>
    </Card>
  )
}
