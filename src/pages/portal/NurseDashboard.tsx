import { useEffect, useState } from 'react'
import { api, todayISO } from '../../lib/api'
import type { Appointment } from '../../lib/types'
import { PageHeader, StatusBadge } from '../../components/UI'

export default function NurseDashboard() {
  const [items, setItems] = useState<Appointment[] | null>(null)

  async function refresh() {
    const r = await api.get<Appointment[]>(`appointments?date=${todayISO()}`)
    if (r.data) setItems(r.data)
  }
  useEffect(() => { refresh() }, [])

  async function setStatus(id: string, status: string) {
    await api.put('appointments', { id, status })
    refresh()
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Nursing workflow" subtitle="Today’s patient preparation and observations." />
      <section className="card p-5">
        <h3 className="font-semibold text-navy-800">Preparation queue</h3>
        <p className="text-xs text-slate-500 mt-1">Mark patients ready for the doctor when preparation is complete.</p>
        <div className="overflow-x-auto mt-3">
          <table className="table-wrap">
            <thead><tr><th>Time</th><th>Patient</th><th>Reason</th><th>Status</th><th></th></tr></thead>
            <tbody>
              {(items ?? []).map(a => (
                <tr key={a.id}>
                  <td>{a.time}</td>
                  <td>{a.patient_id.slice(0, 8)}…</td>
                  <td className="max-w-sm truncate">{a.reason}</td>
                  <td><StatusBadge status={a.status} /></td>
                  <td className="text-right space-x-1">
                    {a.status === 'CONFIRMED' && <button onClick={() => setStatus(a.id, 'CHECKED_IN')} className="btn btn-ghost text-xs">Checked in</button>}
                  </td>
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
