import { withAuth, audit } from './_lib/auth.js'

interface AppointmentRow {
  id?: string
  patient_id: string
  service_id: string
  doctor_id: string | null
  date: string
  time: string
  reason: string
  status?: string
  channel?: string
  notes?: string | null
}

export default withAuth({ requireUser: true, permission: 'appointment.read' }, async (req, res, { supabase, user }) => {
  try {
    if (req.method === 'GET') {
      const query = (req.url || '').split('?')[1] || ''
      const params = new URLSearchParams(query)
      let q = supabase.from('appointments').select('*').order('date', { ascending: true })
      const status = params.get('status')
      const doctorId = params.get('doctor_id')
      const patientId = params.get('patient_id')
      const date = params.get('date')
      const from = params.get('from')
      const to = params.get('to')
      if (status) q = q.eq('status', status)
      if (doctorId) q = q.eq('doctor_id', doctorId)
      if (patientId) q = q.eq('patient_id', patientId)
      if (date) q = q.eq('date', date)
      if (from) q = q.gte('date', from)
      if (to) q = q.lte('date', to)
      // Patients only see their own
      if (user.role === 'PATIENT') {
        q = q.eq('patient_id', user.id)
      }
      const { data, error } = await q
      if (error) throw error
      res.statusCode = 200
      return res.end(JSON.stringify(data))
    }
    if (req.method === 'POST') {
      const body = (await readBodySafe(req)) as AppointmentRow
      // Conflict detection
      const { data: conflict } = await supabase
        .from('appointments')
        .select('id')
        .eq('doctor_id', body.doctor_id)
        .eq('date', body.date)
        .eq('time', body.time)
        .in('status', ['REQUESTED', 'CONFIRMED', 'RESCHEDULED', 'CHECKED_IN'])
        .maybeSingle()
      if (conflict) {
        await audit('appointment.conflict', 'appointments', user, 'DENIED', { id: conflict.id })
        res.statusCode = 409
        return res.end(JSON.stringify({ error: 'That slot is already booked.' }))
      }
      const insert = {
        patient_id: body.patient_id,
        service_id: body.service_id,
        doctor_id: body.doctor_id,
        date: body.date,
        time: body.time,
        reason: body.reason,
        status: body.status ?? 'REQUESTED',
        channel: body.channel ?? 'ONLINE',
        notes: body.notes ?? null,
        created_by: user.id,
      }
      const { data, error } = await supabase.from('appointments').insert(insert).select().single()
      if (error) throw error
      await audit('appointment.create', `appointments:${data.id}`, user, 'SUCCESS', { status: data.status })
      await supabase.from('notifications').insert({
        user_id: body.patient_id,
        kind: 'APPOINTMENT_REQUESTED',
        title: 'Appointment request received',
        message: `Your appointment request for ${body.date} at ${body.time} is pending confirmation.`,
        read: false,
      })
      res.statusCode = 201
      return res.end(JSON.stringify(data))
    }
    if (req.method === 'PUT') {
      const body = (await readBodySafe(req)) as { id: string; status?: string; date?: string; time?: string; doctor_id?: string; reason?: string; notes?: string }
      // Allow patients to cancel their own only
      if (user.role === 'PATIENT' && body.status === 'CANCELLED') {
        // fallthrough to scoped update below
      } else if (!['ADMIN', 'SUPER_ADMIN', 'DOCTOR', 'NURSE', 'RECEPTIONIST'].includes(user.role)) {
        res.statusCode = 403
        return res.end(JSON.stringify({ error: 'Forbidden' }))
      }

      let scoped = supabase
      if (user.role === 'PATIENT') {
        const { data: own } = await scoped.from('appointments').select('patient_id').eq('id', body.id).maybeSingle()
        if (!own || own.patient_id !== user.id) {
          res.statusCode = 403
          return res.end(JSON.stringify({ error: 'Forbidden' }))
        }
      }

      if (body.status === 'CONFIRMED' && (body.date || body.time)) {
        // Conflict re-check
        const check = await scoped.from('appointments').select('id, doctor_id, date, time').eq('id', body.id).maybeSingle()
        if (check.data) {
          const newDate = body.date ?? check.data.date
          const newTime = body.time ?? check.data.time
          const newDoctor = body.doctor_id ?? check.data.doctor_id
          const { data: conflict } = await scoped
            .from('appointments')
            .select('id')
            .eq('doctor_id', newDoctor)
            .eq('date', newDate)
            .eq('time', newTime)
            .in('status', ['REQUESTED', 'CONFIRMED', 'RESCHEDULED', 'CHECKED_IN'])
            .neq('id', body.id)
            .maybeSingle()
          if (conflict) {
            res.statusCode = 409
            return res.end(JSON.stringify({ error: 'That slot is already booked.' }))
          }
        }
      }

      const update = {
        status: body.status,
        date: body.date,
        time: body.time,
        doctor_id: body.doctor_id,
        reason: body.reason,
        notes: body.notes,
      }
      const { data, error } = await scoped.from('appointments').update(update).eq('id', body.id).select().single()
      if (error) throw error

      // Notification side effects
      const patientId = (data as { patient_id: string }).patient_id
      const kind = body.status === 'CONFIRMED' ? 'APPOINTMENT_CONFIRMED'
        : body.status === 'CANCELLED' ? 'APPOINTMENT_CANCELLED'
        : body.status === 'RESCHEDULED' ? 'APPOINTMENT_RESCHEDULED'
        : 'GENERIC'
      if (kind !== 'GENERIC') {
        await scoped.from('notifications').insert({
          user_id: patientId,
          kind,
          title: `Appointment ${body.status?.toLowerCase() ?? 'updated'}`,
          message: `Your appointment for ${body.date ?? data.date} at ${body.time ?? data.time} is now ${body.status}.`,
          read: false,
        })
      }
      await audit('appointment.update', `appointments:${body.id}`, user, 'SUCCESS', { status: body.status })
      res.statusCode = 200
      return res.end(JSON.stringify(data))
    }
    if (req.method === 'DELETE') {
      const body = (await readBodySafe(req)) as { id: string }
      if (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN') {
        res.statusCode = 403
        return res.end(JSON.stringify({ error: 'Forbidden' }))
      }
      const { error } = await supabase.from('appointments').delete().eq('id', body.id)
      if (error) throw error
      await audit('appointment.delete', `appointments:${body.id}`, user, 'SUCCESS')
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
