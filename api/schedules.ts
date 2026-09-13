import { withAuth, audit } from './_lib/auth'

export default withAuth({ requireUser: true }, async (req, res, { supabase, user }) => {
  try {
    if (req.method === 'GET') {
      const query = (req.url || '').split('?')[1] || ''
      const params = new URLSearchParams(query)
      let q = supabase.from('schedules').select('*')
      const doctorId = params.get('doctor_id')
      if (doctorId) q = q.eq('doctor_id', doctorId)
      const { data, error } = await q
      if (error) throw error
      res.statusCode = 200
      return res.end(JSON.stringify(data))
    }
    if (req.method === 'POST') {
      if (!['ADMIN', 'SUPER_ADMIN', 'RECEPTIONIST'].includes(user.role)) {
        res.statusCode = 403
        return res.end(JSON.stringify({ error: 'Forbidden' }))
      }
      const body = await readBodySafe(req)
      const { data, error } = await supabase.from('schedules').insert({
        doctor_id: body.doctor_id,
        weekday: body.weekday,
        start_time: body.start_time,
        end_time: body.end_time,
        slot_minutes: body.slot_minutes ?? 30,
        active: body.active ?? true,
      }).select().single()
      if (error) throw error
      await audit('schedule.create', `schedules:${data.id}`, user, 'SUCCESS')
      res.statusCode = 201
      return res.end(JSON.stringify(data))
    }
    if (req.method === 'DELETE') {
      if (!['ADMIN', 'SUPER_ADMIN', 'RECEPTIONIST'].includes(user.role)) {
        res.statusCode = 403
        return res.end(JSON.stringify({ error: 'Forbidden' }))
      }
      const body = await readBodySafe(req)
      const { error } = await supabase.from('schedules').delete().eq('id', body.id)
      if (error) throw error
      await audit('schedule.delete', `schedules:${body.id}`, user, 'SUCCESS')
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
