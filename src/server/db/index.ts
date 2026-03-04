import { neon } from '@neondatabase/serverless'
import { drizzle } from 'drizzle-orm/neon-http'
import * as schema from './schema'
import { getRequiredRuntimeValue, type RuntimeBindings } from '@/server/env'

type DbInstance = ReturnType<typeof drizzle<typeof schema>>

let cachedDb: DbInstance | null = null
let cachedDatabaseUrl: string | null = null

export function getDb(bindings?: RuntimeBindings): DbInstance {
  const databaseUrl = getRequiredRuntimeValue('DATABASE_URL', bindings)

  if (cachedDb && cachedDatabaseUrl === databaseUrl) {
    return cachedDb
  }

  const sql = neon(databaseUrl)
  const db = drizzle(sql, { schema })

  cachedDb = db
  cachedDatabaseUrl = databaseUrl

  return db
}
