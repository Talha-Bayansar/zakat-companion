import { z } from "zod"

import {
  fiqhPreferenceSchema,
  fiqhMadhabCodeValues,
  fiqhNisabBenchmarkCodeValues,
  type FiqhMadhabCode,
  type FiqhNisabBenchmarkCode,
} from "@/features/fiqh-calculation"

type CreateProfileSchemaMessages = {
  requiredName: string
  maxNameLength: string
  requiredMadhab: string
  requiredNisabBenchmark: string
}

type ManageProfileAccessSchemaMessages = {
  requiredEmail: string
  invalidEmail: string
}

export function createProfileSchema(messages: CreateProfileSchemaMessages) {
  return z.object({
    name: z
      .string()
      .trim()
      .min(1, messages.requiredName)
      .max(120, messages.maxNameLength),
    madhab: z
      .string()
      .trim()
      .min(1, messages.requiredMadhab)
      .refine((value) => fiqhMadhabCodeValues.includes(value as FiqhMadhabCode), {
        message: messages.requiredMadhab,
      }),
    nisabBenchmark: z
      .string()
      .trim()
      .min(1, messages.requiredNisabBenchmark)
      .refine(
        (value) =>
          fiqhNisabBenchmarkCodeValues.includes(
            value as FiqhNisabBenchmarkCode,
          ),
        {
          message: messages.requiredNisabBenchmark,
        },
      ),
  })
}

export const profileDetailsInputSchema = z.object({
  name: z.string().trim().min(1).max(120),
}).merge(fiqhPreferenceSchema)

export function createManageProfileAccessSchema(
  messages: ManageProfileAccessSchemaMessages,
) {
  return z.object({
    email: z.string().trim().min(1, messages.requiredEmail).email(messages.invalidEmail),
  })
}

export type CreateProfileValues = {
  name: string
  madhab: FiqhMadhabCode
  nisabBenchmark: FiqhNisabBenchmarkCode
}

export type ProfileDetailsFormValues = {
  name: string
  madhab: string
  nisabBenchmark: string
}

export type UpdateProfileValues = CreateProfileValues & {
  profileId: string
}

export type ManageProfileAccessValues = {
  email: string
}
