import { betterAuth } from 'better-auth'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { tanstackStartCookies } from 'better-auth/tanstack-start'
import { getDb } from '@/server/db'
import * as schema from '@/server/db/schema'
let cachedAuth: any = null
let cachedAuthKey: string | null = null

export function getAuth() {
  const secret = process.env.BETTER_AUTH_SECRET
  const databaseUrl = process.env.DATABASE_URL

  if (!secret) throw new Error('BETTER_AUTH_SECRET is not set')
  if (!databaseUrl) throw new Error('DATABASE_URL is not set')

  const cacheKey = `${databaseUrl}::${secret}`

  if (cachedAuth && cachedAuthKey === cacheKey) {
    return cachedAuth
  }

  const auth = betterAuth({
    secret,
    database: drizzleAdapter(getDb(), {
      provider: 'pg',
      schema,
    }),
    emailAndPassword: {
      enabled: true,
    },
    plugins: [tanstackStartCookies()],
  })

  cachedAuth = auth
  cachedAuthKey = cacheKey

  return auth
}
