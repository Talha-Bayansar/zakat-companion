import { betterAuth } from 'better-auth'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { tanstackStartCookies } from 'better-auth/tanstack-start'
import { getDb } from '@/server/db'
import * as schema from '@/server/db/schema'
import { getRequiredRuntimeValue, type RuntimeBindings } from '@/server/env'

let cachedAuth: any = null
let cachedAuthKey: string | null = null

export function getAuth(bindings?: RuntimeBindings) {
  const secret = getRequiredRuntimeValue('BETTER_AUTH_SECRET', bindings)
  const databaseUrl = getRequiredRuntimeValue('DATABASE_URL', bindings)
  const cacheKey = `${databaseUrl}::${secret}`

  if (cachedAuth && cachedAuthKey === cacheKey) {
    return cachedAuth
  }

  const auth = betterAuth({
    secret,
    database: drizzleAdapter(getDb(bindings), {
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
