import { withAuth, audit } from './_lib/auth'

export default withAuth({ permission: 'content.read' }, async (req, res, { supabase, user }) => {
  try {
    if (req.method === 'GET') {
      const { data, error } = await supabase.from('doctors').select('*').order('name')
      if (error) throw error
      res.statusCode = 200
      return res.end(JSON.stringify(data))
    }
    if (req.method === 'POST') {
      if (!['ADMIN', 'SUPER_ADMIN', 'CONTENT_MANAGER'].includes(user.role)) {
        res.statusCode = 403
        return res.end(JSON.stringify({ error: 'Forbidden' }))
      }
      const body = await readBodySafe(req)
      const { data, error } = await supabase.from('doctors').insert({
        name: body.name,
        specialty: body.specialty,
        qualifications: body.qualifications ?? 'To be verified by administration',
        biography: body.biography ?? 'To be completed by administration.',
        experience: body.experience ?? 'To be verified',
        languages: body.languages ?? 'Amharic, English',
        photo_url: body.photo_url ?? null,
        available: body.available ?? true,
        status: body.status ?? 'DRAFT',
      }).select().single()
      if (error) throw error
      await audit('doctor.write', `doctors:${data.id}`, user, 'SUCCESS')
      res.statusCode = 201
      return res.end(JSON.stringify(data))
    }
    if (req.method === 'PUT') {
      if (!['ADMIN', 'SUPER_ADMIN', 'CONTENT_MANAGER'].includes(user.role)) {
        res.statusCode = 403
        return res.end(JSON.stringify({ error: 'Forbidden' }))
      }
      const body = await readBodySafe(req)
      const { data, error } = await supabase.from('doctors').update(body).eq('id', body.id).select().single()
      if (error) throw error
      await audit('doctor.write', `doctors:${body.id}`, user, 'SUCCESS')
      res.statusCode = 200
      return res.end(JSON.stringify(data))
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
