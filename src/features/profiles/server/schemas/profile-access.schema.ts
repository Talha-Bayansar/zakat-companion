import { z } from "zod"

export const createProfileInputSchema = z.object({
  name: z.string().trim().min(1).max(120),
})

export const switchActiveProfileInputSchema = z.object({
  profileId: z.string().trim().min(1),
})

export const manageProfileAccessInputSchema = z.object({
  profileId: z.string().trim().min(1),
  email: z.string().trim().email(),
})

export type CreateProfileInput = z.infer<typeof createProfileInputSchema>
export type SwitchActiveProfileInput = z.infer<
  typeof switchActiveProfileInputSchema
>
export type ManageProfileAccessInput = z.infer<
  typeof manageProfileAccessInputSchema
>
