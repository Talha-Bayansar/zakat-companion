import { z } from "zod"

import {
  fiqhPreferenceSchema,
} from "@/features/fiqh-calculation"

const hawlStartedAtSchema = z
  .preprocess(
    (value) => (value === "" ? null : value),
    z
      .string()
      .trim()
      .regex(/^\d{4}-\d{2}-\d{2}$/)
      .nullable()
      .optional(),
  )

export const createProfileInputSchema = z.object({
  name: z.string().trim().min(1).max(120),
  hawlStartedAt: hawlStartedAtSchema,
}).merge(fiqhPreferenceSchema)

export const updateProfileInputSchema = z.object({
  profileId: z.string().trim().min(1),
  name: z.string().trim().min(1).max(120),
  hawlStartedAt: hawlStartedAtSchema,
}).merge(fiqhPreferenceSchema)

export const deleteProfileInputSchema = z.object({
  profileId: z.string().trim().min(1),
})

export const switchActiveProfileInputSchema = z.object({
  profileId: z.string().trim().min(1),
})

export const listProfileAccessInputSchema = z.object({
  profileId: z.string().trim().min(1),
})

export const getAccessibleProfileInputSchema = z.object({
  profileId: z.string().trim().min(1),
})

export const listAccessibleProfilesPageInputSchema = z.object({
  page: z.number().int().min(1).optional().default(1),
  pageSize: z.number().int().min(1).max(100).optional(),
  search: z.string().trim().optional().default(""),
})

export const manageProfileAccessInputSchema = z.object({
  profileId: z.string().trim().min(1),
  email: z.string().trim().email(),
})

export type CreateProfileInput = z.infer<typeof createProfileInputSchema>
export type UpdateProfileInput = z.infer<typeof updateProfileInputSchema>
export type DeleteProfileInput = z.infer<typeof deleteProfileInputSchema>
export type SwitchActiveProfileInput = z.infer<
  typeof switchActiveProfileInputSchema
>
export type GetAccessibleProfileInput = z.infer<
  typeof getAccessibleProfileInputSchema
>
export type ListProfileAccessInput = z.infer<typeof listProfileAccessInputSchema>
export type ListAccessibleProfilesPageInput = z.infer<
  typeof listAccessibleProfilesPageInputSchema
>
export type ManageProfileAccessInput = z.infer<
  typeof manageProfileAccessInputSchema
>
