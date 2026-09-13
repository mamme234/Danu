import { withAuth, audit } from './_lib/auth'

export default withAuth({ permission: 'content.read' }, async (req, res, { supabase, user }) => {
  try {
    if (req.method === 'GET') {
      const query = (req.url || '').split('?')[1] || ''
      const params = new URLSearchParams(query)
      const block = params.get('block')
      const resource = params.get('resource') || 'content_blocks'
      let table = resource
      let q = supabase.from(table).select('*')
      if (block) q = q.eq('key', block)
      if (resource === 'content_blocks') q = q.order('key')
      if (resource === 'articles') q = q.order('created_at', { ascending: false })
      if (resource === 'faq_items') q = q.order('order')
      if (resource === 'facilities') q = q.order('order')
      const { data, error } = await q
      if (error) throw error
      res.statusCode = 200
      return res.end(JSON.stringify(data))
    }
    if (req.method === 'POST' || req.method === 'PUT') {
      if (!['ADMIN', 'SUPER_ADMIN', 'CONTENT_MANAGER'].includes(user.role)) {
        res.statusCode = 403
        return res.end(JSON.stringify({ error: 'Forbidden' }))
      }
      const body = await readBodySafe(req)
      const resource = (body.resource as string) || 'content_blocks'
      const row = body.row
      let res2
      if (req.method === 'POST') {
        res2 = await supabase.from(resource).insert(row).select().single()
      } else {
        res2 = await supabase.from(resource).update(row).eq('id', row.id).select().single()
      }
      if (res2.error) throw res2.error
      await audit('content.write', `${resource}:${res2.data.id}`, user, 'SUCCESS')
      res.statusCode = req.method === 'POST' ? 201 : 200
      return res.end(JSON.stringify(res2.data))
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
