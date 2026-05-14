import { describe, expect, it } from "vitest"

import {
  calculateFiqhCalculation,
  fiqhCalculationVersion,
  fiqhHawlLengthDays,
  fiqhZakatRate,
} from "@/features/fiqh-calculation"

describe("fiqh calculation engine", () => {
  const asOf = new Date("2026-05-14T00:00:00Z")

  const dateRuleExpectations = {
    hanafi: {
      policy: "reset",
      summary: "A sub-nisab dip resets the current hawl in this version.",
    },
    maliki: {
      policy: "preserve",
      summary: "A sub-nisab dip preserves the current hawl in this version.",
    },
    shafii: {
      policy: "reset",
      summary: "A sub-nisab dip resets the current hawl in this version.",
    },
    hanbali: {
      policy: "preserve",
      summary: "A sub-nisab dip preserves the current hawl in this version.",
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
      elapsedDays: 317,
      requiredDays: fiqhHawlLengthDays,
      isComplete: false,
      resetRequired: policy === "reset",
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

    expect(result).toEqual({
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
        requiredDays: fiqhHawlLengthDays,
        isComplete: true,
        resetRequired: false,
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
      zakatDueAmount: "0.00",
      hawl: {
        elapsedDays: 347,
        requiredDays: fiqhHawlLengthDays,
        isComplete: false,
        resetRequired: false,
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
        requiredDays: fiqhHawlLengthDays,
        isComplete: false,
        resetRequired: false,
      },
    })
  })
})
