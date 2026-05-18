import { eq } from "drizzle-orm"

import { db } from "@/server/db/client"
import { nisabBenchmarkPrice } from "@/server/db/schema"

import type { BenchmarkPricingCurrency } from "../../lib/benchmark-pricing.constants"
import type {
  BenchmarkPricingRecord,
  BenchmarkPricingSnapshot,
} from "../../lib/benchmark-pricing.types"

function toBenchmarkPricingRecord(
  record: typeof nisabBenchmarkPrice.$inferSelect,
): BenchmarkPricingRecord {
  return {
    currency: record.currency as BenchmarkPricingCurrency,
    provider: record.provider,
    goldPrice: record.goldPrice,
    silverPrice: record.silverPrice,
    sourceTimestamp: record.sourceTimestamp,
    lastSuccessfulAt: record.lastSuccessfulAt,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
  }
}

export async function getCurrentBenchmarkPricingRecord(
  currency: BenchmarkPricingCurrency,
) {
  const [record] = await db
    .select()
    .from(nisabBenchmarkPrice)
    .where(eq(nisabBenchmarkPrice.currency, currency))
    .limit(1)

  return record ? toBenchmarkPricingRecord(record) : null
}

export async function upsertCurrentBenchmarkPricingRecord(
  input: BenchmarkPricingSnapshot,
  lastSuccessfulAt = new Date(),
) {
  const [record] = await db
    .insert(nisabBenchmarkPrice)
    .values({
      currency: input.currency,
      provider: input.provider,
      goldPrice: input.goldPrice,
      silverPrice: input.silverPrice,
      sourceTimestamp:
        input.sourceTimestamp instanceof Date
          ? input.sourceTimestamp
          : new Date(input.sourceTimestamp),
      lastSuccessfulAt,
    })
    .onConflictDoUpdate({
      target: nisabBenchmarkPrice.currency,
      set: {
        provider: input.provider,
        goldPrice: input.goldPrice,
        silverPrice: input.silverPrice,
        sourceTimestamp:
          input.sourceTimestamp instanceof Date
            ? input.sourceTimestamp
            : new Date(input.sourceTimestamp),
        lastSuccessfulAt,
        updatedAt: lastSuccessfulAt,
      },
    })
    .returning()

  return toBenchmarkPricingRecord(record)
}

