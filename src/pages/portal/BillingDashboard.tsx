import { useEffect, useState } from 'react'
import { api, formatDate, formatETB } from '../../lib/api'
import type { Invoice, Payment } from '../../lib/types'
import { PageHeader, StatusBadge } from '../../components/UI'

export default function BillingDashboard() {
  const [invoices, setInvoices] = useState<Invoice[] | null>(null)
  const [active, setActive] = useState<Invoice | null>(null)
  const [amount, setAmount] = useState('')
  const [method, setMethod] = useState<'CASH' | 'BANK' | 'TELEBIRR' | 'CHAPA' | 'OTHER'>('CASH')
  const [reference, setReference] = useState('')

  async function refresh() {
    const r = await api.get<Invoice[]>('invoices')
    if (r.data) setInvoices(r.data)
  }
  useEffect(() => { refresh() }, [])

  async function recordPayment() {
    if (!active) return
    const r = await api.post<Payment>('payments', {
      invoice_id: active.id,
      amount: Number(amount),
      method,
      reference,
    })
    if (r.error) { alert(r.error.message); return }
    setActive(null); setAmount(''); setReference(''); refresh()
  }

  const total = (invoices ?? []).reduce((s, i) => s + Number(i.total), 0)
  const paid  = (invoices ?? []).reduce((s, i) => s + Number(i.paid), 0)
  const open  = total - paid

  return (
    <div className="space-y-6">
      <PageHeader title="Billing overview" subtitle="Issued invoices, outstanding balances and payments." />

      <div className="grid sm:grid-cols-3 gap-4">
        <Stat title="Total issued" value={formatETB(total)} />
        <Stat title="Paid" value={formatETB(paid)} />
        <Stat title="Outstanding" value={formatETB(open)} />
      </div>

      <section className="card p-5">
        <div className="overflow-x-auto">
          <table className="table-wrap">
            <thead><tr><th>Number</th><th>Patient</th><th>Issued</th><th>Total</th><th>Paid</th><th>Status</th><th></th></tr></thead>
            <tbody>
              {(invoices ?? []).map(i => (
                <tr key={i.id}>
                  <td>{i.number}</td>
                  <td>{i.patient_name}</td>
                  <td>{formatDate(i.created_at)}</td>
                  <td>{formatETB(Number(i.total))}</td>
                  <td>{formatETB(Number(i.paid))}</td>
                  <td><StatusBadge status={i.status} /></td>
                  <td className="text-right">
                    {i.status !== 'PAID' && i.status !== 'CANCELLED' && (
                      <button onClick={() => setActive(i)} className="btn btn-primary text-xs">Record payment</button>
                    )}
                  </td>
                </tr>
              ))}
              {!invoices && <tr><td colSpan={7} className="text-sm text-slate-500">Loading…</td></tr>}
            </tbody>
          </table>
        </div>
      </section>

      {active && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 p-4">
          <div className="card p-6 w-full max-w-md">
            <h3 className="font-semibold text-navy-800">Record payment for {active.number}</h3>
            <div className="space-y-3 mt-4">
              <input className="field" placeholder="Amount" value={amount} onChange={e => setAmount(e.target.value)} />
              <select className="field" value={method} onChange={e => setMethod(e.target.value as any)}>
                <option value="CASH">Cash</option>
                <option value="BANK">Bank transfer</option>
                <option value="TELEBIRR">Telebirr</option>
                <option value="CHAPA">Chapa</option>
                <option value="OTHER">Other</option>
              </select>
              <input className="field" placeholder="Reference (optional)" value={reference} onChange={e => setReference(e.target.value)} />
              <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg p-3">
                Payment providers (Telebirr, Chapa, banks) are integrated by
                configuring the corresponding provider credentials. Until then,
                payments are recorded against the invoice only.
              </p>
            </div>
            <div className="flex justify-end gap-2 mt-5">
              <button onClick={() => setActive(null)} className="btn btn-ghost">Cancel</button>
              <button onClick={recordPayment} className="btn btn-primary">Save payment</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function Stat({ title, value }: { title: string; value: string }) {
  return (
    <div className="stat-card">
      <p className="text-xs uppercase font-semibold text-slate-500">{title}</p>
      <p className="text-2xl font-extrabold text-navy-800 mt-2">{value}</p>
    </div>
  )
}
