import { z } from "zod"

type SignInSchemaMessages = {
  invalidEmail: string
  requiredPassword: string
}

type SignUpSchemaMessages = SignInSchemaMessages & {
  minPasswordLength: string
  requiredConfirmPassword: string
  passwordsDoNotMatch: string
}

export function createSignInSchema(messages: SignInSchemaMessages) {
  return z.object({
    email: z.string().trim().email(messages.invalidEmail),
    password: z.string().min(1, messages.requiredPassword),
  })
}

export function createSignUpSchema(messages: SignUpSchemaMessages) {
  return z
    .object({
      email: z.string().trim().email(messages.invalidEmail),
      password: z.string().min(8, messages.minPasswordLength),
      confirmPassword: z.string().min(1, messages.requiredConfirmPassword),
    })
    .refine((values) => values.password === values.confirmPassword, {
      message: messages.passwordsDoNotMatch,
      path: ["confirmPassword"],
    })
}

export type SignInValues = {
  email: string
  password: string
}

export type SignUpValues = {
  email: string
  password: string
  confirmPassword: string
}
