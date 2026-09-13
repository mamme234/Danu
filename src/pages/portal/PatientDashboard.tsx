import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api, formatDate, formatDateTime } from '../../lib/api'
import type { Appointment, Invoice, NotificationItem } from '../../lib/types'
import { PageHeader, StatusBadge, EmptyState } from '../../components/UI'

export default function PatientDashboard() {
  const [appts, setAppts] = useState<Appointment[] | null>(null)
  const [invoices, setInvoices] = useState<Invoice[] | null>(null)
  const [notifs, setNotifs] = useState<NotificationItem[] | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      api.get<Appointment[]>('appointments'),
      api.get<Invoice[]>('invoices'),
      api.get<NotificationItem[]>('notifications'),
    ]).then(([a, b, c]) => {
      if (a.data) setAppts(a.data)
      if (b.data) setInvoices(b.data)
      if (c.data) setNotifs(c.data)
      setLoading(false)
    })
  }, [])

  const upcoming = (appts ?? []).filter(a => new Date(`${a.date}T${a.time}`).getTime() >= Date.now() && a.status !== 'CANCELLED' && a.status !== 'COMPLETED')
  const unread = (notifs ?? []).filter(n => !n.read).length
  const outstanding = (invoices ?? []).filter(i => i.status !== 'PAID' && i.status !== 'CANCELLED').reduce((s, i) => s + (Number(i.total) - Number(i.paid)), 0)

  return (
    <div className="space-y-6">
      <PageHeader title="Patient dashboard" subtitle="Your appointments, invoices and updates in one place." actions={<Link to="/appointment" className="btn btn-primary">New appointment</Link>} />

      <div className="grid sm:grid-cols-3 gap-4">
        <StatCard title="Upcoming" value={String(upcoming.length)} caption="appointments" />
        <StatCard title="Outstanding" value={outstanding > 0 ? `${outstanding.toLocaleString('en-ET')} ETB` : '—'} caption="balance" />
        <StatCard title="Unread" value={String(unread)} caption="notifications" />
      </div>

      <section className="card p-5">
        <h3 className="font-semibold text-navy-800">Upcoming appointments</h3>
        {loading && <p className="text-sm text-slate-500 mt-3">Loading…</p>}
        {!loading && upcoming.length === 0 && (
          <EmptyState title="No upcoming appointments" message="You can request a new appointment at any time." action={<Link to="/appointment" className="btn btn-primary">Book appointment</Link>} />
        )}
        {!loading && upcoming.length > 0 && (
          <div className="overflow-x-auto mt-3">
            <table className="table-wrap">
              <thead><tr><th>Date</th><th>Time</th><th>Reason</th><th>Status</th></tr></thead>
              <tbody>
                {upcoming.map(a => (
                  <tr key={a.id}>
                    <td>{formatDate(a.date)}</td>
                    <td>{a.time}</td>
                    <td className="max-w-xs truncate">{a.reason}</td>
                    <td><StatusBadge status={a.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="card p-5">
        <h3 className="font-semibold text-navy-800">Recent notifications</h3>
        <ul className="mt-3 divide-y divide-slate-100">
          {(notifs ?? []).slice(0, 5).map(n => (
            <li key={n.id} className={`py-3 ${n.read ? 'opacity-70' : ''}`}>
              <div className="text-sm font-semibold text-navy-800">{n.title}</div>
              <div className="text-sm text-slate-600">{n.message}</div>
              <div className="text-[11px] text-slate-500 mt-1">{formatDateTime(n.created_at)}</div>
            </li>
          ))}
          {(notifs ?? []).length === 0 && <li className="py-3 text-sm text-slate-500">No notifications.</li>}
        </ul>
      </section>
    </div>
  )
}

function StatCard({ title, value, caption }: { title: string; value: string; caption: string }) {
  return (
    <div className="stat-card">
      <p className="text-xs font-semibold text-slate-500 uppercase">{title}</p>
      <p className="text-2xl font-extrabold text-navy-800 mt-2">{value}</p>
      <p className="text-[11px] text-slate-500 mt-1">{caption}</p>
    </div>
  )
}
