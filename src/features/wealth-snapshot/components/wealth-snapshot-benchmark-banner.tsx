import { HugeiconsIcon } from "@hugeicons/react"
import { AlertCircleIcon, BadgeInfoIcon } from "@hugeicons/core-free-icons"

import { m } from "@/paraglide/messages"

import {
  getBenchmarkPricingFreshnessLabel,
  isBenchmarkPricingStale,
} from "@/features/benchmark-pricing"
import type { BenchmarkPricingRecord } from "@/features/benchmark-pricing"
import { Spinner } from "@/shared/ui/spinner"

type WealthSnapshotBenchmarkBannerProps = {
  benchmarkPricing: BenchmarkPricingRecord | null
  isLoading?: boolean
}

export function WealthSnapshotBenchmarkBanner({
  benchmarkPricing,
  isLoading = false,
}: WealthSnapshotBenchmarkBannerProps) {
  if (isLoading) {
    return (
      <div className="flex items-center gap-2 rounded-2xl border border-border/60 bg-background/70 px-4 py-3 text-sm text-muted-foreground">
        <Spinner
          label={m.wealth_snapshot_benchmark_loading()}
          className="size-4"
        />
        <span>{m.wealth_snapshot_benchmark_loading()}</span>
      </div>
    )
  }

  if (!benchmarkPricing) {
    return (
      <p className="rounded-2xl border border-dashed border-border/60 bg-background/70 px-4 py-3 text-sm leading-6 text-muted-foreground">
        {m.wealth_snapshot_benchmark_unavailable()}
      </p>
    )
  }

  const stale = isBenchmarkPricingStale(benchmarkPricing)

  return (
    <div
      className={[
        "space-y-2 rounded-2xl border px-4 py-3 text-sm leading-6",
        stale
          ? "border-amber-500/20 bg-amber-500/5 text-amber-800 dark:text-amber-200"
          : "border-border/60 bg-background/70 text-muted-foreground",
      ].join(" ")}
    >
      <div className="flex items-start gap-3">
        <span
          className={[
            "mt-0.5 inline-flex size-8 shrink-0 items-center justify-center rounded-full",
            stale
              ? "bg-amber-500/10 text-amber-700 dark:bg-amber-400/10 dark:text-amber-200"
              : "bg-muted/60 text-muted-foreground",
          ].join(" ")}
        >
          <HugeiconsIcon
            icon={stale ? AlertCircleIcon : BadgeInfoIcon}
            strokeWidth={2}
            className="size-4"
          />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-[0.7rem] font-medium uppercase tracking-[0.18em] text-muted-foreground">
            {m.settings_active_profile_fiqh_benchmark_freshness_label()}
          </p>
          <p className="mt-0.5 text-sm leading-6 text-foreground">
            {getBenchmarkPricingFreshnessLabel(benchmarkPricing)}
          </p>
        </div>
      </div>

      <p className="text-xs leading-5 text-muted-foreground">
        {stale
          ? m.wealth_snapshot_benchmark_stale_note()
          : m.wealth_snapshot_benchmark_capture_note()}
      </p>
    </div>
  )
}
