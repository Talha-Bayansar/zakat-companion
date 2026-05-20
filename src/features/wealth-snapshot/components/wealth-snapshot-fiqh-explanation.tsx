import { m } from "@/paraglide/messages"

import {
  getFiqhMadhabLabel,
  getFiqhNisabBenchmarkLabel,
  type FiqhMadhabCode,
} from "@/features/fiqh-calculation"

import type { WealthSnapshotRecord } from "../lib/wealth-snapshot.types"

type WealthSnapshotFiqhExplanationProps = {
  snapshot: WealthSnapshotRecord
}

export function WealthSnapshotFiqhExplanation({
  snapshot,
}: WealthSnapshotFiqhExplanationProps) {
  const explanation = snapshot.fiqhExplanation

  if (!explanation) {
    return (
      <p className="text-sm leading-6 text-muted-foreground">
        {m.wealth_snapshot_explanation_not_available()}
      </p>
    )
  }

  return (
    <details className="rounded-2xl border border-border/70 bg-muted/20 px-4 py-3">
      <summary className="cursor-pointer list-none text-sm font-medium text-foreground">
        {m.wealth_snapshot_explanation_title()}
      </summary>

      <div className="mt-4 space-y-4">
        <p className="text-sm leading-6 text-muted-foreground">
          {m.wealth_snapshot_explanation_description()}
        </p>

        <Section title={m.wealth_snapshot_explanation_inputs_title()}>
          <KeyValueList
            items={[
              {
                label: m.wealth_snapshot_current_madhab_label(),
                value: getFiqhMadhabLabel(explanation.inputs.madhab),
              },
              {
                label: m.wealth_snapshot_current_nisab_benchmark_label(),
                value: getFiqhNisabBenchmarkLabel(explanation.inputs.nisabBenchmark),
              },
              {
                label: m.wealth_snapshot_current_net_label(),
                value: formatAmount(explanation.inputs.netZakatableBase),
              },
              {
                label: m.wealth_snapshot_explanation_threshold_label(),
                value: formatAmount(explanation.inputs.nisabThreshold),
              },
              {
                label: m.wealth_snapshot_explanation_captured_at_label(),
                value: formatDate(explanation.inputs.asOf),
              },
            ]}
          />
        </Section>

        {explanation.benchmark ? (
          <Section title={m.wealth_snapshot_explanation_benchmark_title()}>
            <KeyValueList
              items={[
                {
                  label: m.wealth_snapshot_explanation_benchmark_currency_label(),
                  value: explanation.benchmark.currency,
                },
                {
                  label: m.wealth_snapshot_explanation_benchmark_provider_label(),
                  value: explanation.benchmark.provider,
                },
                {
                  label: m.wealth_snapshot_current_nisab_benchmark_label(),
                  value: getFiqhNisabBenchmarkLabel(
                    explanation.benchmark.selectedBenchmark,
                  ),
                },
                {
                  label: m.wealth_snapshot_explanation_benchmark_price_label(),
                  value: formatAmount(explanation.benchmark.selectedBenchmarkPrice),
                },
                {
                  label: m.wealth_snapshot_explanation_threshold_label(),
                  value: formatAmount(explanation.benchmark.nisabThreshold),
                },
                {
                  label: m.settings_active_profile_fiqh_benchmark_freshness_label(),
                  value: getBenchmarkFreshnessValue(explanation),
                },
                {
                  label: m.wealth_snapshot_explanation_benchmark_source_timestamp_label(),
                  value: formatDate(explanation.benchmark.sourceTimestamp),
                },
              ]}
            />
          </Section>
        ) : null}

        <Section title={m.wealth_snapshot_explanation_nisab_title()}>
          <KeyValueList
            items={[
              {
                label: m.wealth_snapshot_current_nisab_status_label(),
                value: getNisabStatusLabel(explanation.nisab.isAboveNisab),
              },
              {
                label: m.wealth_snapshot_explanation_difference_label(),
                value: formatAmount(explanation.nisab.difference),
              },
            ]}
          />
        </Section>

        <Section title={m.wealth_snapshot_explanation_hawl_title()}>
          <p className="text-sm leading-6 text-foreground">
            {getDateRuleSummary(snapshot.madhab)}
          </p>

          <KeyValueList
            items={[
              {
                label: m.wealth_snapshot_explanation_elapsed_days_label(),
                value:
                  explanation.hawl.elapsedDays === null
                    ? m.wealth_snapshot_current_value_unavailable()
                    : String(explanation.hawl.elapsedDays),
              },
              {
                label: m.wealth_snapshot_explanation_hawl_due_at_label(),
                value:
                  explanation.hawl.dueAt === null
                    ? m.wealth_snapshot_current_value_unavailable()
                    : formatDate(explanation.hawl.dueAt),
              },
              {
                label: m.wealth_snapshot_explanation_required_days_label(),
                value:
                  explanation.hawl.hijriYearLengthDays === null
                    ? m.wealth_snapshot_current_value_unavailable()
                    : String(explanation.hawl.hijriYearLengthDays),
              },
            ]}
          />
        </Section>

        <Section title={m.wealth_snapshot_explanation_due_title()}>
          <KeyValueList
            items={[
              {
                label: m.wealth_snapshot_current_due_amount_label(),
                value: explanation.dueAmount.isZakatDue
                  ? formatAmount(explanation.dueAmount.amount)
                  : m.wealth_snapshot_current_due_not_yet_label(),
              },
            ]}
          />
        </Section>
      </div>
    </details>
  )
}

function Section({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <section className="space-y-2">
      <p className="text-[0.7rem] font-medium uppercase tracking-[0.18em] text-muted-foreground">
        {title}
      </p>
      {children}
    </section>
  )
}

function KeyValueList({
  items,
}: {
  items: Array<{ label: string; value: string }>
}) {
  return (
    <dl className="grid gap-2 sm:grid-cols-2">
      {items.map((item) => (
        <div
          key={item.label}
          className="rounded-xl border border-border/60 bg-background/70 px-3 py-2.5"
        >
          <dt className="text-[0.7rem] font-medium uppercase tracking-[0.18em] text-muted-foreground">
            {item.label}
          </dt>
          <dd className="mt-1 text-sm leading-6 text-foreground">{item.value}</dd>
        </div>
      ))}
    </dl>
  )
}

function formatAmount(value: string) {
  const parsed = Number(value)

  if (!Number.isFinite(parsed)) {
    return value
  }

  return new Intl.NumberFormat(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(parsed)
}

function formatDate(value: string) {
  const date = new Date(value)

  return Number.isNaN(date.getTime()) ? value : date.toLocaleString()
}

function getBenchmarkFreshnessValue(
  explanation: NonNullable<
    WealthSnapshotRecord["fiqhExplanation"]
  >,
) {
  if (!explanation.benchmark) {
    return m.wealth_snapshot_current_value_unavailable()
  }

  return explanation.benchmark.freshness.label
}

function getNisabStatusLabel(isAboveNisab: boolean) {
  return isAboveNisab
    ? m.wealth_snapshot_current_nisab_above_label()
    : m.wealth_snapshot_current_nisab_below_label()
}

function getDateRuleSummary(snapshotMadhab: FiqhMadhabCode | null) {
  if (!snapshotMadhab) {
    return m.wealth_snapshot_current_date_rule_unavailable()
  }

  switch (snapshotMadhab) {
    case "hanafi":
      return m.wealth_snapshot_current_date_rule_preserve_summary()
    case "maliki":
    case "shafii":
    case "hanbali":
      return m.wealth_snapshot_current_date_rule_reset_summary()
  }
}
