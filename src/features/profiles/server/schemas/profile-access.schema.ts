import { z } from "zod"

export const createProfileInputSchema = z.object({
  name: z.string().trim().min(1).max(120),
})

export const updateProfileInputSchema = z.object({
  profileId: z.string().trim().min(1),
  name: z.string().trim().min(1).max(120),
})

export const deleteProfileInputSchema = z.object({
  profileId: z.string().trim().min(1),
})

export const switchActiveProfileInputSchema = z.object({
  profileId: z.string().trim().min(1),
})

export const listProfileAccessInputSchema = z.object({
  profileId: z.string().trim().min(1),
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
export type ListProfileAccessInput = z.infer<typeof listProfileAccessInputSchema>
export type ManageProfileAccessInput = z.infer<
  typeof manageProfileAccessInputSchema
>
