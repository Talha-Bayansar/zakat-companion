import { createServerFn } from "@tanstack/react-start"
import { env } from "cloudflare:workers"

import { getBootstrapBenchmarkPricing } from "../services/benchmark-pricing.service"

export const getCurrentBenchmarkPricingFn = createServerFn({ method: "GET" }).handler(
  async () => {
    return getBootstrapBenchmarkPricing({
      apiKey: env.METALS_DEV_API_KEY,
    })
  },
)

