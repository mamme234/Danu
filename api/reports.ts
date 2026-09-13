// Reporting endpoint: appointments, billing, doctor utilization.
import { withAuth } from './_lib/auth.js'

export default withAuth({ requireUser: true, permission: 'reports.read' }, async (req, res, { supabase }) => {
  try {
    if (req.method !== 'GET') {
      res.statusCode = 405
      return res.end(JSON.stringify({ error: 'Method not allowed' }))
    }
    const params = new URLSearchParams((req.url || '').split('?')[1] || '')
    const from = params.get('from')
    const to = params.get('to')

    const range = (q: any) => {
      let r = q
      if (from) r = r.gte('date', from)
      if (to) r = r.lte('date', to)
      return r
    }

    const [{ data: appts }, { data: invoices }, { data: doctors }, { data: services }] = await Promise.all([
      range(supabase.from('appointments').select('*')),
      (() => {
        let r = supabase.from('invoices').select('*')
        if (from) r = r.gte('created_at', from)
        if (to) r = r.lte('created_at', to)
        return r
      })(),
      supabase.from('doctors').select('id, name'),
      supabase.from('services').select('id, name'),
    ])

    const byStatus: Record<string, number> = {}
    ;(appts || []).forEach((a: any) => { byStatus[a.status] = (byStatus[a.status] || 0) + 1 })

    const revenuePaid = (invoices || []).reduce((s: number, i: any) => s + Number(i.paid), 0)
    const revenueOutstanding = (invoices || []).reduce((s: number, i: any) => s + (Number(i.total) - Number(i.paid)), 0)

    const byDoctor: Record<string, number> = {}
    ;(appts || []).forEach((a: any) => {
      if (!a.doctor_id) return
      byDoctor[a.doctor_id] = (byDoctor[a.doctor_id] || 0) + 1
    })

    const byService: Record<string, number> = {}
    ;(appts || []).forEach((a: any) => { byService[a.service_id] = (byService[a.service_id] || 0) + 1 })

    const doctorNames = Object.fromEntries((doctors || []).map((d: any) => [d.id, d.name]))
    const serviceNames = Object.fromEntries((services || []).map((s: any) => [s.id, s.name]))

    res.statusCode = 200
    res.end(JSON.stringify({
      appointmentCount: (appts || []).length,
      appointmentsByStatus: byStatus,
      revenueETB: { paid: revenuePaid, outstanding: revenueOutstanding },
      appointmentsByDoctor: byDoctor,
      doctorNames,
      appointmentsByService: byService,
      serviceNames,
      invoiceCount: (invoices || []).length,
    }))
  } catch (e) {
    res.statusCode = 500
    res.end(JSON.stringify({ error: (e as Error).message }))
  }
})
