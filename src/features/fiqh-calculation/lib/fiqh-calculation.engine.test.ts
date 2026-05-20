import { describe, expect, it } from "vitest"

import {
  calculateFiqhCalculation,
  fiqhCalculationVersion,
  addHijriYears,
  fiqhZakatRate,
  getHijriYearLengthDays,
} from "@/features/fiqh-calculation"

describe("fiqh calculation engine", () => {
  const asOf = new Date("2026-05-14T00:00:00Z")

  const dateRuleExpectations = {
    hanafi: {
      policy: "preserve",
      summary:
        "A sub-nisab dip preserves the current hawl, but the anniversary can still reset it if nisab is still unmet.",
    },
    maliki: {
      policy: "reset",
      summary:
        "A sub-nisab dip resets the current hawl immediately in this version.",
    },
    shafii: {
      policy: "reset",
      summary:
        "A sub-nisab dip resets the current hawl immediately in this version.",
    },
    hanbali: {
      policy: "reset",
      summary:
        "A sub-nisab dip resets the current hawl immediately in this version.",
    },
  } as const

  it.each([
    ["hanafi", "reset"],
    ["maliki", "preserve"],
    ["shafii", "reset"],
    ["hanbali", "preserve"],
  ] as const)("applies the %s madhab's hawl policy", (madhab, policy) => {
    const result = calculateFiqhCalculation({
      madhab,
      nisabBenchmark: "gold",
      netZakatableBase: "60.00",
      nisabThreshold: "75.00",
      hawlStartedAt: new Date("2025-07-01T00:00:00Z"),
      asOf,
    })

    expect(result.snapshot).toEqual({
      madhab,
      nisabBenchmark: "gold",
      calculationVersion: fiqhCalculationVersion,
      netZakatableBase: "60.00",
      isAboveNisab: false,
      isZakatDue: false,
    })
    expect(result.dateRule).toEqual(dateRuleExpectations[madhab])
    expect(result.hawl).toMatchObject({
      startedAt: new Date("2025-07-01T00:00:00Z"),
      asOf,
      elapsedDays: 317,
      dueAt: addHijriYears(new Date("2025-07-01T00:00:00Z"), 1),
      hijriYearLengthDays: getHijriYearLengthDays(
        new Date("2025-07-01T00:00:00Z"),
      ),
      isComplete: false,
      resetRequired: policy === "reset",
    })
    expect(result.explanation).toMatchObject({
      inputs: {
        madhab,
        nisabBenchmark: "gold",
        netZakatableBase: "60.00",
        nisabThreshold: "75.00",
        hawlStartedAt: "2025-07-01T00:00:00.000Z",
        asOf: "2026-05-14T00:00:00.000Z",
      },
      nisab: {
        netZakatableBase: "60.00",
        nisabThreshold: "75.00",
        difference: "-15.00",
        isAboveNisab: false,
      },
      hawl: {
        startedAt: "2025-07-01T00:00:00.000Z",
        asOf: "2026-05-14T00:00:00.000Z",
        elapsedDays: 317,
        dueAt: addHijriYears(new Date("2025-07-01T00:00:00Z"), 1).toISOString(),
        hijriYearLengthDays: getHijriYearLengthDays(
          new Date("2025-07-01T00:00:00Z"),
        ),
        isComplete: false,
        resetRequired: policy === "reset",
      },
      dueAmount: {
        rate: fiqhZakatRate,
        amount: "0.00",
        isZakatDue: false,
      },
      dateRule: dateRuleExpectations[madhab],
    })
  })

  it("treats a Hanafi anniversary below nisab as a reset even though the hawl is preserved before that", () => {
    const result = calculateFiqhCalculation({
      madhab: "hanafi",
      nisabBenchmark: "gold",
      netZakatableBase: "60.00",
      nisabThreshold: "75.00",
      hawlStartedAt: new Date("2025-05-01T00:00:00Z"),
      asOf,
    })

    expect(result.dateRule).toEqual(dateRuleExpectations.hanafi)
    expect(result.hawl).toMatchObject({
      isComplete: true,
      resetRequired: true,
    })
    expect(result.explanation.hawl).toMatchObject({
      isComplete: true,
      resetRequired: true,
    })
  })

  it("calculates the frozen snapshot and due amount for an above-nisab, complete hawl case", () => {
    const result = calculateFiqhCalculation({
      madhab: "hanafi",
      nisabBenchmark: "gold",
      netZakatableBase: "100.00",
      nisabThreshold: "87.50",
      hawlStartedAt: new Date("2025-05-01T00:00:00Z"),
      asOf,
    })

    expect(result).toMatchObject({
      snapshot: {
        madhab: "hanafi",
        nisabBenchmark: "gold",
        calculationVersion: fiqhCalculationVersion,
        netZakatableBase: "100.00",
        isAboveNisab: true,
        isZakatDue: true,
      },
      nisabThreshold: "87.50",
      nisabDifference: "12.50",
      zakatRate: fiqhZakatRate,
      zakatDueAmount: "2.50",
      dateRule: dateRuleExpectations.hanafi,
      hawl: {
        startedAt: new Date("2025-05-01T00:00:00Z"),
        asOf,
        elapsedDays: 378,
        dueAt: addHijriYears(new Date("2025-05-01T00:00:00Z"), 1),
        hijriYearLengthDays: getHijriYearLengthDays(
          new Date("2025-05-01T00:00:00Z"),
        ),
        isComplete: true,
        resetRequired: false,
      },
      explanation: {
        inputs: {
          madhab: "hanafi",
          nisabBenchmark: "gold",
          netZakatableBase: "100.00",
          nisabThreshold: "87.50",
          hawlStartedAt: "2025-05-01T00:00:00.000Z",
          asOf: "2026-05-14T00:00:00.000Z",
        },
        nisab: {
          netZakatableBase: "100.00",
          nisabThreshold: "87.50",
          difference: "12.50",
          isAboveNisab: true,
        },
        hawl: {
        startedAt: "2025-05-01T00:00:00.000Z",
        asOf: "2026-05-14T00:00:00.000Z",
        elapsedDays: 378,
        dueAt: addHijriYears(new Date("2025-05-01T00:00:00Z"), 1).toISOString(),
        hijriYearLengthDays: getHijriYearLengthDays(
          new Date("2025-05-01T00:00:00Z"),
        ),
        isComplete: true,
        resetRequired: false,
      },
        dueAmount: {
          rate: fiqhZakatRate,
          amount: "2.50",
          isZakatDue: true,
        },
        dateRule: dateRuleExpectations.hanafi,
      },
    })
  })

  it("treats an exact nisab match as above nisab and due only once the hawl is complete", () => {
    const result = calculateFiqhCalculation({
      madhab: "maliki",
      nisabBenchmark: "silver",
      netZakatableBase: "75.00",
      nisabThreshold: "75.00",
      hawlStartedAt: new Date("2025-06-01T00:00:00Z"),
      asOf,
    })

    expect(result.snapshot).toEqual({
      madhab: "maliki",
      nisabBenchmark: "silver",
      calculationVersion: fiqhCalculationVersion,
      netZakatableBase: "75.00",
      isAboveNisab: true,
      isZakatDue: false,
    })
    expect(result).toMatchObject({
      nisabThreshold: "75.00",
      nisabDifference: "0.00",
      zakatRate: fiqhZakatRate,
      zakatDueAmount: "0.00",
      hawl: {
        startedAt: new Date("2025-06-01T00:00:00Z"),
        asOf,
        elapsedDays: 347,
        dueAt: addHijriYears(new Date("2025-06-01T00:00:00Z"), 1),
        hijriYearLengthDays: getHijriYearLengthDays(
          new Date("2025-06-01T00:00:00Z"),
        ),
        isComplete: false,
        resetRequired: false,
      },
      explanation: {
        inputs: {
          madhab: "maliki",
          nisabBenchmark: "silver",
          netZakatableBase: "75.00",
          nisabThreshold: "75.00",
          hawlStartedAt: "2025-06-01T00:00:00.000Z",
          asOf: "2026-05-14T00:00:00.000Z",
        },
        nisab: {
          netZakatableBase: "75.00",
          nisabThreshold: "75.00",
          difference: "0.00",
          isAboveNisab: true,
        },
        hawl: {
        startedAt: "2025-06-01T00:00:00.000Z",
        asOf: "2026-05-14T00:00:00.000Z",
        elapsedDays: 347,
        dueAt: addHijriYears(new Date("2025-06-01T00:00:00Z"), 1).toISOString(),
        hijriYearLengthDays: getHijriYearLengthDays(
          new Date("2025-06-01T00:00:00Z"),
        ),
        isComplete: false,
        resetRequired: false,
      },
        dueAmount: {
          rate: fiqhZakatRate,
          amount: "0.00",
          isZakatDue: false,
        },
        dateRule: dateRuleExpectations.maliki,
      },
    })
  })

  it("keeps the calculation version explicit when the caller overrides it", () => {
    const result = calculateFiqhCalculation({
      madhab: "hanbali",
      nisabBenchmark: "gold",
      netZakatableBase: "87.49",
      nisabThreshold: "87.50",
      hawlStartedAt: null,
      asOf,
      calculationVersion: "fiqh-v2",
    })

    expect(result.snapshot).toEqual({
      madhab: "hanbali",
      nisabBenchmark: "gold",
      calculationVersion: "fiqh-v2",
      netZakatableBase: "87.49",
      isAboveNisab: false,
      isZakatDue: false,
    })
    expect(result).toMatchObject({
      nisabThreshold: "87.50",
      nisabDifference: "-0.01",
      zakatRate: fiqhZakatRate,
      zakatDueAmount: "0.00",
      hawl: {
        startedAt: null,
        asOf,
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
          netZakatableBase: "87.49",
          nisabThreshold: "87.50",
          hawlStartedAt: null,
          asOf: "2026-05-14T00:00:00.000Z",
        },
        nisab: {
          netZakatableBase: "87.49",
          nisabThreshold: "87.50",
          difference: "-0.01",
          isAboveNisab: false,
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
          rate: fiqhZakatRate,
          amount: "0.00",
          isZakatDue: false,
        },
        dateRule: dateRuleExpectations.hanbali,
      },
    })
  })
})
