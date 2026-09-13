import { useEffect, useState } from 'react'
import { api, formatDateTime } from '../../lib/api'
import type { AuditLog } from '../../lib/types'
import { PageHeader } from '../../components/UI'

export default function AuditLogPage() {
  const [items, setItems] = useState<AuditLog[] | null>(null)

  useEffect(() => { api.get<AuditLog[]>('audit').then(r => { if (r.data) setItems(r.data) }) }, [])

  return (
    <div className="space-y-6">
      <PageHeader title="Audit log" subtitle="Append-only record of sensitive operations." />
      <section className="card p-5">
        <div className="overflow-x-auto">
          <table className="table-wrap">
            <thead><tr><th>When</th><th>Actor</th><th>Action</th><th>Resource</th><th>Result</th></tr></thead>
            <tbody>
              {(items ?? []).map(a => (
                <tr key={a.id}>
                  <td>{formatDateTime(a.created_at)}</td>
                  <td>{a.actor_email}</td>
                  <td>{a.action}</td>
                  <td className="font-mono text-xs">{a.resource}</td>
                  <td><span className={`badge ${a.result === 'SUCCESS' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : a.result === 'DENIED' ? 'bg-amber-50 text-amber-800 border-amber-200' : 'bg-red-50 text-red-700 border-red-200'}`}>{a.result}</span></td>
                </tr>
              ))}
              {!items && <tr><td colSpan={5} className="text-sm text-slate-500">Loading…</td></tr>}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}
