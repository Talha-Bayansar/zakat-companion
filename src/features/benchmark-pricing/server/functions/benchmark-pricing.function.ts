import { createServerFn } from "@tanstack/react-start"

import { getCurrentBenchmarkPricing } from "../services/benchmark-pricing.service"

export const getCurrentBenchmarkPricingFn = createServerFn({ method: "GET" }).handler(
  async () => {
    return getCurrentBenchmarkPricing()
  },
)

