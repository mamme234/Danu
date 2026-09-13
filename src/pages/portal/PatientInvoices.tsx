import { useEffect, useState } from 'react'
import { api, formatDate, formatETB } from '../../lib/api'
import type { Invoice } from '../../lib/types'
import { PageHeader, EmptyState, StatusBadge } from '../../components/UI'

export default function PatientInvoicesPage() {
  const [items, setItems] = useState<Invoice[] | null>(null)

  useEffect(() => { api.get<Invoice[]>('invoices').then(r => { if (r.data) setItems(r.data) }) }, [])

  return (
    <div className="space-y-6">
      <PageHeader title="Invoices" subtitle="Statements, balances and receipts." />
      {!items && <p className="text-sm text-slate-500">Loading…</p>}
      {items && items.length === 0 && <EmptyState title="No invoices" message="You will receive invoices here after consultation." />}
      {items && items.length > 0 && (
        <section className="card p-5">
          <div className="overflow-x-auto">
            <table className="table-wrap">
              <thead><tr><th>Number</th><th>Issued</th><th>Total</th><th>Paid</th><th>Balance</th><th>Status</th></tr></thead>
              <tbody>
                {items.map(i => (
                  <tr key={i.id}>
                    <td>{i.number}</td>
                    <td>{formatDate(i.created_at)}</td>
                    <td>{formatETB(Number(i.total))}</td>
                    <td>{formatETB(Number(i.paid))}</td>
                    <td>{formatETB(Number(i.total) - Number(i.paid))}</td>
                    <td><StatusBadge status={i.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  )
}
