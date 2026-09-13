import { withAuth, audit } from './_lib/auth.js'

export default withAuth({ requireUser: true, permission: 'record.read' }, async (req, res, { supabase, user }) => {
  try {
    if (req.method === 'GET') {
      const query = (req.url || '').split('?')[1] || ''
      const params = new URLSearchParams(query)
      let q = supabase.from('visits').select('*').order('created_at', { ascending: false })
      const patientId = params.get('patient_id')
      if (patientId) q = q.eq('patient_id', patientId)
      // Patients only see their own records
      if (user.role === 'PATIENT') q = q.eq('patient_id', user.id)
      const { data, error } = await q.limit(200)
      if (error) throw error
      res.statusCode = 200
      return res.end(JSON.stringify(data))
    }
    if (req.method === 'POST') {
      if (!['ADMIN', 'SUPER_ADMIN', 'DOCTOR', 'NURSE'].includes(user.role)) {
        res.statusCode = 403
        return res.end(JSON.stringify({ error: 'Forbidden' }))
      }
      const body = await readBodySafe(req)
      const { data, error } = await supabase.from('visits').insert({
        appointment_id: body.appointment_id,
        patient_id: body.patient_id,
        doctor_id: user.id,
        consultation_notes: body.consultation_notes ?? null,
        diagnosis: body.diagnosis ?? null,
        treatment_plan: body.treatment_plan ?? null,
        follow_up_date: body.follow_up_date ?? null,
        completed_at: body.completed_at ?? null,
      }).select().single()
      if (error) throw error
      if (body.appointment_id) {
        await supabase.from('appointments').update({ status: 'COMPLETED' }).eq('id', body.appointment_id)
      }
      await audit('visit.create', `visits:${data.id}`, user, 'SUCCESS')
      res.statusCode = 201
      return res.end(JSON.stringify(data))
    }
    if (req.method === 'PUT') {
      if (!['ADMIN', 'SUPER_ADMIN', 'DOCTOR', 'NURSE'].includes(user.role)) {
        res.statusCode = 403
        return res.end(JSON.stringify({ error: 'Forbidden' }))
      }
      const body = await readBodySafe(req)
      const { data, error } = await supabase.from('visits').update(body).eq('id', body.id).select().single()
      if (error) throw error
      await audit('visit.update', `visits:${body.id}`, user, 'SUCCESS')
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
