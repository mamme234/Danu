// Default-export a shared Supabase client so calls across `src/lib` are
// idempotent. Created from `import.meta.env` so it treeshakes correctly.
import { createClient } from '@supabase/supabase-js'

const url = (import.meta.env.VITE_SUPABASE_URL as string) ?? ''
const anon = (import.meta.env.VITE_SUPABASE_ANON_KEY as string) ?? ''

const supabase = createClient(url || 'https://invalid.invalid', anon || 'invalid', {
  auth: { persistSession: true, autoRefreshToken: true },
})

export default supabase
