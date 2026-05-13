import { describe, expect, it, vi } from "vitest"

vi.mock("@/paraglide/messages", () => ({
  m: {
    fiqh_madhab_hanafi_label: () => "Hanafi",
    fiqh_madhab_maliki_label: () => "Maliki",
    fiqh_madhab_shafii_label: () => "Shafi'i",
    fiqh_madhab_hanbali_label: () => "Hanbali",
    fiqh_nisab_benchmark_gold_label: () => "Gold",
    fiqh_nisab_benchmark_silver_label: () => "Silver",
  },
}))

import {
  fiqhCycleStateValues,
  fiqhMadhabCodeValues,
  fiqhNisabBenchmarkCodeValues,
} from "./fiqh-calculation.constants"
import {
  getFiqhMadhabLabel,
  getFiqhNisabBenchmarkLabel,
} from "./fiqh-calculation.labels"
import {
  fiqhPreferenceSchema,
  fiqhSnapshotWriteContextSchema,
} from "./fiqh-calculation.schemas"

describe("fiqh calculation contract", () => {
  it("freezes the canonical code values", () => {
    expect(fiqhMadhabCodeValues).toEqual([
      "hanafi",
      "maliki",
      "shafii",
      "hanbali",
    ])
    expect(fiqhNisabBenchmarkCodeValues).toEqual(["gold", "silver"])
    expect(fiqhCycleStateValues).toEqual([
      "open",
      "due",
      "paid",
      "followed_up",
    ])
  })

  it("maps codes to localized labels", () => {
    expect(getFiqhMadhabLabel("hanafi")).toBe("Hanafi")
    expect(getFiqhMadhabLabel("shafii")).toBe("Shafi'i")
    expect(getFiqhNisabBenchmarkLabel("gold")).toBe("Gold")
  })

  it("validates fiqh preferences and frozen snapshot context", () => {
    expect(
      fiqhPreferenceSchema.parse({
        madhab: "maliki",
        nisabBenchmark: "silver",
      }),
    ).toEqual({
      madhab: "maliki",
      nisabBenchmark: "silver",
    })

    expect(
      fiqhSnapshotWriteContextSchema.parse({
        madhab: "hanbali",
        nisabBenchmark: "gold",
        calculationVersion: "fiqh-v1",
        netZakatableBase: "87.50",
        isAboveNisab: true,
        isZakatDue: null,
      }),
    ).toEqual({
      madhab: "hanbali",
      nisabBenchmark: "gold",
      calculationVersion: "fiqh-v1",
      netZakatableBase: "87.50",
      isAboveNisab: true,
      isZakatDue: null,
    })
  })
})
