import { withAuth, audit } from './_lib/auth'

export default withAuth({ permission: 'content.read' }, async (req, res, { supabase, user }) => {
  try {
    if (req.method === 'GET') {
      const { data, error } = await supabase.from('services').select('*').order('name')
      if (error) throw error
      res.statusCode = 200
      return res.end(JSON.stringify(data))
    }
    if (req.method === 'POST') {
      if (!['ADMIN', 'SUPER_ADMIN', 'CONTENT_MANAGER'].includes(user.role)) {
        await audit('service.write', 'services', user, 'DENIED')
        res.statusCode = 403
        return res.end(JSON.stringify({ error: 'Forbidden' }))
      }
      const body = await readBodySafe(req)
      const { data, error } = await supabase.from('services').insert({
        name: body.name,
        category: body.category,
        description: body.description,
        duration_minutes: body.duration_minutes ?? 30,
        price_etb: body.price_etb ?? null,
        status: body.status ?? 'DRAFT',
        image_url: body.image_url ?? null,
      }).select().single()
      if (error) throw error
      await audit('service.write', `services:${data.id}`, user, 'SUCCESS', { name: data.name })
      res.statusCode = 201
      return res.end(JSON.stringify(data))
    }
    if (req.method === 'PUT') {
      if (!['ADMIN', 'SUPER_ADMIN', 'CONTENT_MANAGER'].includes(user.role)) {
        res.statusCode = 403
        return res.end(JSON.stringify({ error: 'Forbidden' }))
      }
      const body = await readBodySafe(req)
      const { data, error } = await supabase.from('services').update(body).eq('id', body.id).select().single()
      if (error) throw error
      await audit('service.write', `services:${body.id}`, user, 'SUCCESS')
      res.statusCode = 200
      return res.end(JSON.stringify(data))
    }
    if (req.method === 'DELETE') {
      if (!['ADMIN', 'SUPER_ADMIN'].includes(user.role)) {
        res.statusCode = 403
        return res.end(JSON.stringify({ error: 'Forbidden' }))
      }
      const body = await readBodySafe(req)
      const { error } = await supabase.from('services').delete().eq('id', body.id)
      if (error) throw error
      await audit('service.delete', `services:${body.id}`, user, 'SUCCESS')
      res.statusCode = 200
      return res.end(JSON.stringify({ ok: true }))
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
