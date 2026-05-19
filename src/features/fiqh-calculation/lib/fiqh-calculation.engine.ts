import {
  fiqhCalculationVersion,
  fiqhZakatRate,
} from "./fiqh-calculation.constants"
import {
  addHijriYears,
  getHijriYearLengthDays,
} from "./hijri-calendar"
import type {
  FiqhCalculationInput,
  FiqhCalculationOutcome,
  FiqhDateRule,
} from "./fiqh-calculation.types"

const MS_PER_DAY = 24 * 60 * 60 * 1000
const ZAKAT_RATE_BASIS_POINTS = 250

function parseAmountToCents(amount: string) {
  const normalized = amount.trim()

  if (!normalized) {
    return 0
  }

  const [wholePart = "0", fractionPart = ""] = normalized.split(".")
  const whole = Number.parseInt(wholePart, 10)
  const fraction = Number.parseInt(`${fractionPart}00`.slice(0, 2), 10)

  return (
    (Number.isFinite(whole) ? whole : 0) * 100 +
    (Number.isFinite(fraction) ? fraction : 0)
  )
}

function formatCents(value: number) {
  const absoluteValue = Math.abs(value)
  const whole = Math.trunc(absoluteValue / 100)
  const fraction = String(absoluteValue % 100).padStart(2, "0")

  return `${value < 0 ? "-" : ""}${whole}.${fraction}`
}

function diffInWholeDays(startedAt: Date, asOf: Date) {
  return Math.max(0, Math.floor((asOf.getTime() - startedAt.getTime()) / MS_PER_DAY))
}

const dateRules = {
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
} as const satisfies Record<string, FiqhDateRule>

function getDateRule(madhab: FiqhCalculationInput["madhab"]): FiqhDateRule {
  return dateRules[madhab]
}

export function calculateFiqhCalculation(
  input: FiqhCalculationInput,
): FiqhCalculationOutcome {
  const calculationVersion =
    input.calculationVersion?.trim() || fiqhCalculationVersion
  const netZakatableBaseCents = parseAmountToCents(input.netZakatableBase)
  const nisabThresholdCents = parseAmountToCents(input.nisabThreshold)
  const nisabDifferenceCents = netZakatableBaseCents - nisabThresholdCents
  const isAboveNisab = nisabDifferenceCents >= 0
  const dateRule = getDateRule(input.madhab)
  const hawlStartedAt = input.hawlStartedAt
  const elapsedDays =
    hawlStartedAt === null ? null : diffInWholeDays(hawlStartedAt, input.asOf)
  const hawlDueAt =
    hawlStartedAt === null ? null : addHijriYears(hawlStartedAt, 1)
  const hawl = {
    startedAt: hawlStartedAt,
    asOf: input.asOf,
    elapsedDays,
    dueAt: hawlDueAt,
    hijriYearLengthDays:
      hawlStartedAt === null ? null : getHijriYearLengthDays(hawlStartedAt),
    isComplete:
      hawlDueAt !== null ? input.asOf.getTime() >= hawlDueAt.getTime() : false,
    resetRequired: dateRule.policy === "reset" && !isAboveNisab,
  }
  const isZakatDue = isAboveNisab && hawl.isComplete
  const zakatDueAmountCents = isZakatDue
    ? Math.round((netZakatableBaseCents * ZAKAT_RATE_BASIS_POINTS) / 10000)
    : 0

  return {
    snapshot: {
      madhab: input.madhab,
      nisabBenchmark: input.nisabBenchmark,
      calculationVersion,
      netZakatableBase: formatCents(netZakatableBaseCents),
      isAboveNisab,
      isZakatDue,
    },
    nisabThreshold: formatCents(nisabThresholdCents),
    nisabDifference: formatCents(nisabDifferenceCents),
    zakatRate: fiqhZakatRate,
    zakatDueAmount: formatCents(zakatDueAmountCents),
    dateRule,
    hawl,
    explanation: {
      inputs: {
        madhab: input.madhab,
        nisabBenchmark: input.nisabBenchmark,
        netZakatableBase: input.netZakatableBase,
        nisabThreshold: input.nisabThreshold,
        hawlStartedAt: input.hawlStartedAt?.toISOString() ?? null,
        asOf: input.asOf.toISOString(),
      },
      nisab: {
        netZakatableBase: formatCents(netZakatableBaseCents),
        nisabThreshold: formatCents(nisabThresholdCents),
        difference: formatCents(nisabDifferenceCents),
        isAboveNisab,
      },
      hawl: {
        startedAt: hawlStartedAt?.toISOString() ?? null,
        asOf: input.asOf.toISOString(),
        elapsedDays,
        dueAt: hawl.dueAt?.toISOString() ?? null,
        hijriYearLengthDays: hawl.hijriYearLengthDays,
        isComplete: hawl.isComplete,
        resetRequired: hawl.resetRequired,
      },
      dueAmount: {
        rate: fiqhZakatRate,
        amount: formatCents(zakatDueAmountCents),
        isZakatDue,
      },
      dateRule,
    },
  }
}
