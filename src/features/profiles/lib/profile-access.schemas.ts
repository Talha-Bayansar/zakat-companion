import { z } from "zod"

type CreateProfileSchemaMessages = {
  requiredName: string
  maxNameLength: string
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
  })
}

export function createManageProfileAccessSchema(
  messages: ManageProfileAccessSchemaMessages,
) {
  return z.object({
    email: z.string().trim().min(1, messages.requiredEmail).email(messages.invalidEmail),
  })
}

export type CreateProfileValues = {
  name: string
}

export type ManageProfileAccessValues = {
  email: string
}
