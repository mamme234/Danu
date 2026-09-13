import { useEffect, useState } from 'react'
import { api, formatDateTime, formatETB } from '../../lib/api'
import type { Appointment, Invoice, AuditLog, Patient } from '../../lib/types'
import { PageHeader, StatusBadge } from '../../components/UI'

export default function AdminDashboard() {
  const [stats, setStats] = useState<{
    appointmentCount: number; invoiceCount: number;
    revenueETB: { paid: number; outstanding: number };
    appointmentsByStatus: Record<string, number>;
    doctorNames: Record<string, string>;
  } | null>(null)
  const [audit, setAudit] = useState<AuditLog[] | null>(null)
  const [patients, setPatients] = useState<Patient[] | null>(null)
  const [appts, setAppts] = useState<Appointment[] | null>(null)
  const [invoices, setInvoices] = useState<Invoice[] | null>(null)

  useEffect(() => {
    Promise.all([
      api.get<any>('reports'),
      api.get<AuditLog[]>('audit'),
      api.get<Patient[]>('patients'),
      api.get<Appointment[]>('appointments'),
      api.get<Invoice[]>('invoices'),
    ]).then(([s, a, p, ap, iv]) => {
      if (s.data) setStats(s.data)
      if (a.data) setAudit(a.data)
      if (p.data) setPatients(p.data)
      if (ap.data) setAppts(ap.data)
      if (iv.data) setInvoices(iv.data)
    })
  }, [])

  return (
    <div className="space-y-6">
      <PageHeader title="Administration overview" subtitle="Monitor operations, revenue and recent activity." />

      <div className="grid sm:grid-cols-4 gap-4">
        <Stat title="Patients" value={String(patients?.length ?? '—')} />
        <Stat title="Appointments" value={String(appts?.length ?? '—')} />
        <Stat title="Invoices" value={String(invoices?.length ?? '—')} />
        <Stat title="Revenue (paid)" value={stats ? formatETB(stats.revenueETB.paid) : '—'} />
      </div>

      <section className="grid md:grid-cols-2 gap-5">
        <div className="card p-5">
          <h3 className="font-semibold text-navy-800">Appointments by status</h3>
          <ul className="mt-3 space-y-2">
            {stats && Object.entries(stats.appointmentsByStatus).map(([k, v]) => (
              <li key={k} className="flex justify-between items-center">
                <StatusBadge status={k} />
                <span className="font-semibold text-navy-800">{String(v)}</span>
              </li>
            ))}
            {!stats && <li className="text-sm text-slate-500">Loading…</li>}
          </ul>
        </div>
        <div className="card p-5">
          <h3 className="font-semibold text-navy-800">Recent activity</h3>
          <ul className="mt-3 divide-y divide-slate-100 text-sm">
            {(audit ?? []).slice(0, 8).map(a => (
              <li key={a.id} className="py-3 flex justify-between gap-3">
                <div>
                  <div className="text-navy-800 font-medium">{a.action} <span className="text-slate-400">on {a.resource}</span></div>
                  <div className="text-[11px] text-slate-500">{a.actor_email}</div>
                </div>
                <div className="text-[11px] text-slate-500 whitespace-nowrap">{formatDateTime(a.created_at)}</div>
              </li>
            ))}
            {!audit && <li className="text-sm text-slate-500">Loading…</li>}
          </ul>
        </div>
      </section>
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
