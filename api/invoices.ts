import { withAuth, audit } from './_lib/auth.js'

export default withAuth({ requireUser: true, permission: 'billing.read' }, async (req, res, { supabase, user }) => {
  try {
    if (req.method === 'GET') {
      const query = (req.url || '').split('?')[1] || ''
      const params = new URLSearchParams(query)
      let q = supabase.from('invoices').select('*').order('created_at', { ascending: false })
      const patientId = params.get('patient_id')
      const status = params.get('status')
      if (patientId) q = q.eq('patient_id', patientId)
      if (status) q = q.eq('status', status)
      const { data, error } = await q.limit(200)
      if (error) throw error
      res.statusCode = 200
      return res.end(JSON.stringify(data))
    }
    if (req.method === 'POST') {
      if (!['ADMIN', 'SUPER_ADMIN', 'ACCOUNTANT', 'DOCTOR'].includes(user.role)) {
        res.statusCode = 403
        return res.end(JSON.stringify({ error: 'Forbidden' }))
      }
      const body = await readBodySafe(req)
      const items = (body.items as any[]) || []
      const subtotal = items.reduce((s, it) => s + Number(it.qty) * Number(it.unit), 0)
      const number = `INV-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 8999)}`
      const { data, error } = await supabase.from('invoices').insert({
        number,
        patient_id: body.patient_id,
        patient_name: body.patient_name,
        items,
        subtotal,
        total: subtotal,
        paid: 0,
        status: 'UNPAID',
        note: body.note ?? null,
      }).select().single()
      if (error) throw error
      await audit('invoice.create', `invoices:${data.id}`, user, 'SUCCESS', { number })
      res.statusCode = 201
      return res.end(JSON.stringify(data))
    }
    if (req.method === 'PUT') {
      const body = await readBodySafe(req)
      const { data, error } = await supabase.from('invoices').update(body).eq('id', body.id).select().single()
      if (error) throw error
      await audit('invoice.update', `invoices:${body.id}`, user, 'SUCCESS')
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
