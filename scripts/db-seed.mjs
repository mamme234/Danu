#!/usr/bin/env node
// Seed helper: runs supabase/seed/seed.sql against the configured database.

import { readFileSync, existsSync } from 'node:fs'
import { Client } from 'pg'

const url = process.env.SUPABASE_DB_URL
if (!url) {
  console.error('[db:seed] SUPABASE_DB_URL must be set.')
  process.exit(1)
}
const seedPath = new URL('../supabase/seed/seed.sql', import.meta.url).pathname
if (!existsSync(seedPath)) { console.error('seed.sql not found'); process.exit(1) }
const sql = readFileSync(seedPath, 'utf8')

const client = new Client({ connectionString: url })
await client.connect()
try {
  await client.query(sql)
  console.log('[db:seed] complete.')
} finally {
  await client.end()
}
