import { neon } from '@neondatabase/serverless'
import { drizzle } from 'drizzle-orm/neon-http'
import * as schema from './schema'

type DbInstance = ReturnType<typeof drizzle<typeof schema>>

let cachedDb: DbInstance | null = null
let cachedDatabaseUrl: string | null = null

export function getDb(): DbInstance {
  const databaseUrl = process.env.DATABASE_URL
  if (!databaseUrl) throw new Error('DATABASE_URL is not set')

  if (cachedDb && cachedDatabaseUrl === databaseUrl) {
    return cachedDb
  }

  const sql = neon(databaseUrl)
  const db = drizzle(sql, { schema })

  cachedDb = db
  cachedDatabaseUrl = databaseUrl

  return db
}
