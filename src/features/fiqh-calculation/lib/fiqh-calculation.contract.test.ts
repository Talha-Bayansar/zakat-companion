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
  fiqhCalculationOutcomeSchema,
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
      "reset",
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

    expect(
      fiqhCalculationOutcomeSchema.parse({
        snapshot: {
          madhab: "hanbali",
          nisabBenchmark: "gold",
          calculationVersion: "fiqh-v1",
          netZakatableBase: "87.50",
          isAboveNisab: true,
          isZakatDue: false,
        },
        nisabThreshold: "87.50",
        nisabDifference: "0.00",
        zakatRate: "0.025",
        zakatDueAmount: "0.00",
        dateRule: {
          policy: "reset",
          summary: "Reset",
        },
        hawl: {
          startedAt: null,
          asOf: new Date(),
          elapsedDays: null,
          dueAt: null,
          hijriYearLengthDays: null,
          isComplete: false,
          resetRequired: false,
        },
        explanation: {
          inputs: {
            madhab: "hanbali",
            nisabBenchmark: "gold",
            netZakatableBase: "87.50",
            nisabThreshold: "87.50",
            hawlStartedAt: null,
            asOf: "2026-05-14T00:00:00.000Z",
          },
          nisab: {
            netZakatableBase: "87.50",
            nisabThreshold: "87.50",
            difference: "0.00",
            isAboveNisab: true,
          },
          hawl: {
            startedAt: null,
            asOf: "2026-05-14T00:00:00.000Z",
            elapsedDays: null,
            dueAt: null,
            hijriYearLengthDays: null,
            isComplete: false,
            resetRequired: false,
          },
          dueAmount: {
            rate: "0.025",
            amount: "0.00",
            isZakatDue: false,
          },
          dateRule: {
            policy: "reset",
            summary: "Reset",
          },
        },
      }),
    ).toMatchObject({
      explanation: {
        inputs: {
          madhab: "hanbali",
          nisabBenchmark: "gold",
        },
      },
    })
  })
})
