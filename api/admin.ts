import { withAuth, audit } from './_lib/auth.js'

// Administrative updates beyond the per-resource endpoints.
export default withAuth({ requireUser: true, permission: 'staff.write' }, async (req, res, { supabase, user }) => {
  try {
    if (req.method === 'PUT') {
      const body = await readBodySafe(req)
      const { kind, payload } = body
      if (kind === 'staff.role') {
        if (user.role !== 'SUPER_ADMIN') {
          res.statusCode = 403
          return res.end(JSON.stringify({ error: 'Only super admins may change roles.' }))
        }
        const { error } = await supabase.from('user_profiles').update({ role: payload.role, active: payload.active ?? true }).eq('id', payload.user_id)
        if (error) throw error
        await audit('staff.role_change', `user_profiles:${payload.user_id}`, user, 'SUCCESS', { role: payload.role })
        return res.end(JSON.stringify({ ok: true }))
      }
      if (kind === 'settings.update') {
        const { error } = await supabase.from('settings').upsert({ key: payload.key, value: payload.value })
        if (error) throw error
        await audit('settings.update', `settings:${payload.key}`, user, 'SUCCESS')
        return res.end(JSON.stringify({ ok: true }))
      }
      res.statusCode = 400
      return res.end(JSON.stringify({ error: 'Unknown kind' }))
    }
    res.statusCode = 405
    res.end(JSON.stringify({ error: 'Method not allowed' }))
  } catch (e) {
    res.statusCode = 500
    res.end(JSON.stringify({ error: (e as Error).message }))
  }
})

function readBodySafe(req: any) {
  return new Promise<any>((resolve, reject) => {
    let raw = ''
    req.on('data', (c: Buffer) => { raw += c })
    req.on('end', () => { try { resolve(JSON.parse(raw || '{}')) } catch (e) { reject(e) } })
    req.on('error', reject)
  })
}
