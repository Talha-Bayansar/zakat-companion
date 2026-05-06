import { neon } from '@neondatabase/serverless'
import { drizzle } from 'drizzle-orm/neon-http'

const databaseUrl = process.env.DATABASE_URL

function getDatabaseUrl() {
  if (!databaseUrl) {
    throw new Error('DATABASE_URL is required to use the auth database.')
  }

  return databaseUrl
}

const sql = neon(getDatabaseUrl())

export const db = drizzle(sql)
