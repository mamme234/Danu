#!/usr/bin/env node
// Apply the SQL migrations to the configured Supabase Postgres database.
// Requires SUPABASE_DB_URL or NEXT_PUBLIC_SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY.

import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { Client } from 'pg'

const url = process.env.SUPABASE_DB_URL
if (!url) {
  console.error('[db:migrate] SUPABASE_DB_URL must be set.')
  process.exit(1)
}

const dir = new URL('../supabase/migrations', import.meta.url).pathname
const seed = new URL('../supabase/seed/seed.sql', import.meta.url).pathname

async function main() {
  const client = new Client({ connectionString: url })
  await client.connect()
  const files = readdirSync(dir).filter(f => f.endsWith('.sql')).sort()
  for (const file of files) {
    const sql = readFileSync(join(dir, file), 'utf8')
    console.log(`[db:migrate] applying ${file}`)
    await client.query(sql)
  }
  if (existsSync(seed)) {
    const sql = readFileSync(seed, 'utf8')
    console.log('[db:migrate] seeding')
    await client.query(sql)
  }
  await client.end()
  console.log('[db:migrate] complete.')
}

main().catch(err => { console.error(err); process.exit(1) })

function existsSync(path) { return readdirSync(new URL('.').pathname).includes(path.replace(/^\.\//, '')) }
