import { HugeiconsIcon } from '@hugeicons/react'
import { Tick01Icon } from '@hugeicons/core-free-icons'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { SummaryRow } from './summary-row'

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
        <CardTitle className="ios-section-title">Zakat result</CardTitle>
        <p className="ios-copy-muted">Live result in {currency}. Updates as you type.</p>
      </CardHeader>
      <CardContent className="space-y-2 text-sm">
        <SummaryRow label="Total assets" value={totalAssets} />
        <SummaryRow label="Total liabilities" value={totalLiabilities} />
        <SummaryRow label="Net zakatable wealth" value={netWorth} />
        <SummaryRow label="Nisab" value={nisab} />

        <div className="mt-1.5 rounded-2xl border border-slate-200/80 bg-white/80 p-3.5">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Zakat due</p>
          <p className="mt-1.5 text-2xl font-semibold text-slate-900">{zakatDue}</p>
          <p className="mt-1 text-sm text-slate-600">
            {isEligible
              ? 'You are above nisab. Zakat due is 2.5% of your net zakatable wealth.'
              : 'Currently below nisab, so zakat due is 0.'}
          </p>
        </div>

        <Button type="button" className="ios-primary-action mt-2.5 w-full" onClick={onSaveAssessment} loading={isSaving} loadingText="Saving...">
          <HugeiconsIcon icon={Tick01Icon} strokeWidth={2.1} className="mr-2 h-4 w-4" />
          Save assessment
        </Button>
      </CardContent>
    </Card>
  )
}
