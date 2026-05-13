import { m } from "@/paraglide/messages"

import type {
  FiqhMadhabCode,
  FiqhNisabBenchmarkCode,
} from "./fiqh-calculation.constants"

function unreachable(value: never): never {
  throw new Error(`Unhandled fiqh code: ${value}`)
}

export function getFiqhMadhabLabel(madhab: FiqhMadhabCode) {
  switch (madhab) {
    case "hanafi":
      return m.fiqh_madhab_hanafi_label()
    case "maliki":
      return m.fiqh_madhab_maliki_label()
    case "shafii":
      return m.fiqh_madhab_shafii_label()
    case "hanbali":
      return m.fiqh_madhab_hanbali_label()
    default:
      return unreachable(madhab)
  }
}

export function getFiqhNisabBenchmarkLabel(
  nisabBenchmark: FiqhNisabBenchmarkCode,
) {
  switch (nisabBenchmark) {
    case "gold":
      return m.fiqh_nisab_benchmark_gold_label()
    case "silver":
      return m.fiqh_nisab_benchmark_silver_label()
    default:
      return unreachable(nisabBenchmark)
  }
}
