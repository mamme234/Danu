import { withAuth, audit } from './_lib/auth.js'

export default withAuth({ requireUser: true, permission: 'billing.read' }, async (req, res, { supabase, user }) => {
  try {
    if (req.method === 'POST') {
      if (!['ADMIN', 'SUPER_ADMIN', 'ACCOUNTANT'].includes(user.role)) {
        res.statusCode = 403
        return res.end(JSON.stringify({ error: 'Forbidden' }))
      }
      const body = await readBodySafe(req)
      const { data, error } = await supabase.from('payments').insert({
        invoice_id: body.invoice_id,
        amount: body.amount,
        method: body.method,
        reference: body.reference ?? null,
        recorded_by: user.id,
      }).select().single()
      if (error) throw error
      // Update invoice summary
      const { data: invoice } = await supabase.from('invoices').select('*').eq('id', body.invoice_id).single()
      if (invoice) {
        const newPaid = Number(invoice.paid) + Number(body.amount)
        const total = Number(invoice.total)
        const status = newPaid <= 0 ? 'UNPAID' : newPaid >= total ? 'PAID' : 'PARTIALLY_PAID'
        await supabase.from('invoices').update({ paid: newPaid, status }).eq('id', body.invoice_id)
        await supabase.from('notifications').insert({
          user_id: invoice.patient_id,
          kind: 'PAYMENT_RECEIVED',
          title: 'Payment received',
          message: `A payment of ${body.amount} ETB was recorded against ${invoice.number}.`,
          read: false,
        })
      }
      await audit('payment.create', `payments:${data.id}`, user, 'SUCCESS', { amount: body.amount })
      res.statusCode = 201
      return res.end(JSON.stringify(data))
    }
    if (req.method === 'GET') {
      const query = (req.url || '').split('?')[1] || ''
      const params = new URLSearchParams(query)
      let q = supabase.from('payments').select('*').order('created_at', { ascending: false })
      const invoiceId = params.get('invoice_id')
      if (invoiceId) q = q.eq('invoice_id', invoiceId)
      const { data, error } = await q.limit(200)
      if (error) throw error
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
