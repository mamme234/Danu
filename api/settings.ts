import { withAuth, audit } from './_lib/auth.js'

export default withAuth({ requireUser: true }, async (req, res, { supabase, user }) => {
  try {
    if (req.method === 'GET') {
      const { data, error } = await supabase.from('settings').select('key, value')
      if (error) throw error
      const map: Record<string, any> = {}
      for (const row of (data as any[]) ?? []) map[(row as any).key] = (row as any).value
      return res.end(JSON.stringify(map))
    }
    if (req.method === 'PUT') {
      if (!['ADMIN', 'SUPER_ADMIN', 'CONTENT_MANAGER'].includes(user.role)) {
        res.statusCode = 403
        return res.end(JSON.stringify({ error: 'Forbidden' }))
      }
      const body = await readBodySafe(req)
      const { error } = await supabase.from('settings').upsert({ key: body.key, value: body.value })
      if (error) throw error
      await audit('settings.update', `settings:${body.key}`, user, 'SUCCESS')
      return res.end(JSON.stringify({ ok: true }))
    }
    res.statusCode = 405
    return res.end(JSON.stringify({ error: 'Method not allowed' }))
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
