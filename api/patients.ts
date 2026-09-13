import { withAuth, audit } from './_lib/auth'

export default withAuth({ requireUser: true, permission: 'patient.read' }, async (req, res, { supabase, user }) => {
  try {
    if (req.method === 'GET') {
      const query = (req.url || '').split('?')[1] || ''
      const params = new URLSearchParams(query)
      let q = supabase.from('patients').select('*').order('created_at', { ascending: false })
      const search = params.get('q')
      if (search) {
        q = q.or(`first_name.ilike.%${search}%,last_name.ilike.%${search}%,phone.ilike.%${search}%,email.ilike.%${search}%,code.ilike.%${search}%`)
      }
      const { data, error } = await q.limit(200)
      if (error) throw error
      res.statusCode = 200
      return res.end(JSON.stringify(data))
    }
    if (req.method === 'POST') {
      if (!['ADMIN', 'SUPER_ADMIN', 'RECEPTIONIST', 'NURSE'].includes(user.role)) {
        res.statusCode = 403
        return res.end(JSON.stringify({ error: 'Forbidden' }))
      }
      const body = await readBodySafe(req)
      const code = `DANU-P-${Date.now().toString().slice(-6)}`
      const insert = {
        code,
        first_name: body.first_name,
        last_name: body.last_name,
        email: body.email ?? null,
        phone: body.phone ?? '',
        dob: body.dob ?? null,
        gender: body.gender ?? null,
        address: body.address ?? null,
        blood_group: body.blood_group ?? null,
        allergies: body.allergies ?? null,
        notes: body.notes ?? null,
      }
      const { data, error } = await supabase.from('patients').insert(insert).select().single()
      if (error) throw error
      await audit('patient.create', `patients:${data.id}`, user, 'SUCCESS')
      res.statusCode = 201
      return res.end(JSON.stringify(data))
    }
    if (req.method === 'PUT') {
      if (!['ADMIN', 'SUPER_ADMIN', 'DOCTOR', 'NURSE', 'RECEPTIONIST'].includes(user.role)) {
        res.statusCode = 403
        return res.end(JSON.stringify({ error: 'Forbidden' }))
      }
      const body = await readBodySafe(req)
      const { data, error } = await supabase.from('patients').update(body).eq('id', body.id).select().single()
      if (error) throw error
      await audit('patient.update', `patients:${body.id}`, user, 'SUCCESS')
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
