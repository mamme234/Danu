// Simple liveness endpoint used by the Vercel deployment and uptime checks.
import { withAuth } from './_lib/auth'

export default withAuth({}, async (_req, res, { supabase }) => {
  try {
    let dbOk = false
    try {
      const { error } = await supabase.from('settings').select('key').limit(1)
      dbOk = !error
    } catch {
      dbOk = false
    }
    res.statusCode = 200
    res.setHeader('Content-Type', 'application/json')
    res.end(JSON.stringify({
      ok: true,
      service: 'danu-orthopaedic-center',
      db: dbOk ? 'reachable' : 'unreachable',
      time: new Date().toISOString(),
    }))
  } catch (e) {
    res.statusCode = 500
    res.end(JSON.stringify({ ok: false, error: (e as Error).message }))
  }
})
