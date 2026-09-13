import { useEffect, useState } from 'react'
import { api, formatDateTime } from '../../lib/api'
import type { Appointment } from '../../lib/types'
import { PageHeader, StatusBadge, EmptyState } from '../../components/UI'

export default function PatientAppointments() {
  const [appts, setAppts] = useState<Appointment[] | null>(null)
  const [busy, setBusy] = useState<string | null>(null)

  async function refresh() {
    const r = await api.get<Appointment[]>('appointments')
    if (r.data) setAppts(r.data)
  }

  useEffect(() => { refresh() }, [])

  async function cancel(id: string) {
    if (!confirm('Cancel this appointment?')) return
    setBusy(id)
    const r = await api.put<Appointment>('appointments', { id, status: 'CANCELLED' })
    if (!r.error) await refresh()
    setBusy(null)
  }

  return (
    <div className="space-y-6">
      <PageHeader title="My appointments" subtitle="All your past and upcoming visits." />
      <section className="card p-5">
        {!appts && <p className="text-sm text-slate-500">Loading…</p>}
        {appts && appts.length === 0 && <EmptyState title="No appointments yet" message="Request your first appointment from the dashboard." />}
        {appts && appts.length > 0 && (
          <div className="overflow-x-auto">
            <table className="table-wrap">
              <thead><tr><th>Date</th><th>Time</th><th>Reason</th><th>Channel</th><th>Status</th><th></th></tr></thead>
              <tbody>
                {appts.map(a => (
                  <tr key={a.id}>
                    <td>{a.date}</td>
                    <td>{a.time}</td>
                    <td className="max-w-xs truncate">{a.reason}</td>
                    <td>{a.channel}</td>
                    <td><StatusBadge status={a.status} /></td>
                    <td className="text-right">
                      {(a.status === 'REQUESTED' || a.status === 'CONFIRMED') && (
                        <button onClick={() => cancel(a.id)} disabled={busy === a.id} className="text-red-600 hover:text-red-700 text-sm font-semibold">{busy === a.id ? 'Cancelling…' : 'Cancel'}</button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
      <p className="text-xs text-slate-500">{formatDateTime(new Date().toISOString())}</p>
    </div>
  )
}
