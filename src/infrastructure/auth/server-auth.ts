import { drizzleAdapter } from '@better-auth/drizzle-adapter'
import { betterAuth } from 'better-auth'
import { db } from '../db/neon'
import * as schema from './auth-schema'

const baseURL = process.env.BETTER_AUTH_URL ?? 'http://localhost:3000'
const secret =
  process.env.BETTER_AUTH_SECRET ?? 'dev-secret-dev-secret-dev-secret-dev-secret'

export const auth = betterAuth({
  baseURL,
  secret,
  appName: 'Zakat Companion',
  database: drizzleAdapter(db, {
    provider: 'pg',
    schema,
  }),
  emailAndPassword: {
    enabled: true,
  },
})
