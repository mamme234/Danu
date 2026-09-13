import { useEffect, useState } from 'react'
import { api, todayISO } from '../../lib/api'
import type { Appointment } from '../../lib/types'
import { PageHeader, StatusBadge } from '../../components/UI'

export default function ReceptionDashboard() {
  const [today, setToday] = useState<Appointment[] | null>(null)
  const [pending, setPending] = useState<Appointment[] | null>(null)

  async function refresh() {
    const [{ data: t }, { data: p }] = await Promise.all([
      api.get<Appointment[]>(`appointments?date=${todayISO()}`),
      api.get<Appointment[]>('appointments?status=REQUESTED'),
    ])
    if (t) setToday(t)
    if (p) setPending(p)
  }
  useEffect(() => { refresh() }, [])

  async function updateStatus(id: string, status: string) {
    const r = await api.put('appointments', { id, status })
    if (!r.error) refresh()
  }

  const checkedIn   = (today ?? []).filter(a => a.status === 'CHECKED_IN').length
  const completed   = (today ?? []).filter(a => a.status === 'COMPLETED').length
  const cancelled   = (today ?? []).filter(a => a.status === 'CANCELLED').length
  const scheduled   = (today ?? []).filter(a => a.status === 'CONFIRMED').length

  return (
    <div className="space-y-6">
      <PageHeader title="Reception overview" subtitle="Today's appointments, queue and pending requests." />

      <div className="grid sm:grid-cols-4 gap-4">
        <Stat title="Scheduled" value={scheduled} />
        <Stat title="Checked-in" value={checkedIn} />
        <Stat title="Completed" value={completed} />
        <Stat title="Cancelled" value={cancelled} />
      </div>

      <section className="card p-5">
        <h3 className="font-semibold text-navy-800">Today's queue</h3>
        <div className="overflow-x-auto mt-3">
          <table className="table-wrap">
            <thead><tr><th>Time</th><th>Patient</th><th>Status</th><th></th></tr></thead>
            <tbody>
              {(today ?? []).map(a => (
                <tr key={a.id}>
                  <td>{a.time}</td>
                  <td>{a.patient_id.slice(0, 8)}…</td>
                  <td><StatusBadge status={a.status} /></td>
                  <td className="text-right space-x-1">
                    {a.status === 'CONFIRMED' && <button onClick={() => updateStatus(a.id, 'CHECKED_IN')} className="btn btn-ghost text-xs">Check-in</button>}
                    {a.status === 'CHECKED_IN' && <button onClick={() => updateStatus(a.id, 'COMPLETED')} className="btn btn-primary text-xs">Complete</button>}
                    {(a.status === 'REQUESTED' || a.status === 'CONFIRMED' || a.status === 'CHECKED_IN') && <button onClick={() => updateStatus(a.id, 'CANCELLED')} className="btn btn-danger text-xs">Cancel</button>}
                  </td>
                </tr>
              ))}
              {!today && <tr><td colSpan={4} className="text-sm text-slate-500">Loading…</td></tr>}
            </tbody>
          </table>
        </div>
      </section>

      <section className="card p-5">
        <h3 className="font-semibold text-navy-800">Pending requests</h3>
        <div className="overflow-x-auto mt-3">
          <table className="table-wrap">
            <thead><tr><th>Date</th><th>Time</th><th>Reason</th><th></th></tr></thead>
            <tbody>
              {(pending ?? []).map(a => (
                <tr key={a.id}>
                  <td>{a.date}</td>
                  <td>{a.time}</td>
                  <td className="max-w-xs truncate">{a.reason}</td>
                  <td className="text-right space-x-1">
                    <button onClick={() => updateStatus(a.id, 'CONFIRMED')} className="btn btn-primary text-xs">Confirm</button>
                    <button onClick={() => updateStatus(a.id, 'CANCELLED')} className="btn btn-danger text-xs">Decline</button>
                  </td>
                </tr>
              ))}
              {!pending && <tr><td colSpan={4} className="text-sm text-slate-500">Loading…</td></tr>}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}

function Stat({ title, value }: { title: string; value: number }) {
  return (
    <div className="stat-card">
      <p className="text-xs uppercase font-semibold text-slate-500">{title}</p>
      <p className="text-2xl font-extrabold text-navy-800 mt-2">{value}</p>
    </div>
  )
}
