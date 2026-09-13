import { useEffect, useState } from 'react'
import { api } from '../../lib/api'
import type { Patient } from '../../lib/types'
import { PageHeader } from '../../components/UI'

export default function ReceptionPatients() {
  const [patients, setPatients] = useState<Patient[] | null>(null)
  const [search, setSearch] = useState('')
  const [showCreate, setShowCreate] = useState(false)
  const [draft, setDraft] = useState<Partial<Patient>>({})
  const [busy, setBusy] = useState(false)

  async function refresh() {
    const r = await api.get<Patient[]>(`patients?q=${encodeURIComponent(search)}`)
    if (r.data) setPatients(r.data)
  }
  useEffect(() => { refresh() }, [search])

  async function create() {
    setBusy(true)
    const r = await api.post<Patient>('patients', draft)
    setBusy(false)
    if (!r.error) { setShowCreate(false); setDraft({}); refresh() }
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Patients" subtitle="Search and register patients." actions={<button onClick={() => setShowCreate(true)} className="btn btn-primary text-sm">Register patient</button>} />

      <section className="card p-5">
        <input className="field max-w-sm" placeholder="Search by name, phone, code, email…" value={search} onChange={e => setSearch(e.target.value)} />

        <div className="overflow-x-auto mt-4">
          <table className="table-wrap">
            <thead><tr><th>Code</th><th>Name</th><th>Phone</th><th>Email</th><th>DOB</th></tr></thead>
            <tbody>
              {(patients ?? []).slice(0, 30).map(p => (
                <tr key={p.id}>
                  <td>{p.code}</td>
                  <td>{p.first_name} {p.last_name}</td>
                  <td>{p.phone}</td>
                  <td>{p.email}</td>
                  <td>{p.dob}</td>
                </tr>
              ))}
              {!patients && <tr><td colSpan={5} className="text-sm text-slate-500">Loading…</td></tr>}
            </tbody>
          </table>
        </div>
      </section>

      {showCreate && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 p-4">
          <div className="card p-6 w-full max-w-lg">
            <h3 className="font-semibold text-navy-800 text-lg">Register patient</h3>
            <div className="grid grid-cols-2 gap-3 mt-4">
              <input className="field col-span-1" placeholder="First name" value={draft.first_name ?? ''} onChange={e => setDraft({ ...draft, first_name: e.target.value })} />
              <input className="field col-span-1" placeholder="Last name" value={draft.last_name ?? ''} onChange={e => setDraft({ ...draft, last_name: e.target.value })} />
              <input className="field col-span-2" placeholder="Phone" value={draft.phone ?? ''} onChange={e => setDraft({ ...draft, phone: e.target.value })} />
              <input className="field col-span-2" placeholder="Email" value={draft.email ?? ''} onChange={e => setDraft({ ...draft, email: e.target.value })} />
              <input className="field col-span-1" placeholder="DOB YYYY-MM-DD" value={draft.dob ?? ''} onChange={e => setDraft({ ...draft, dob: e.target.value })} />
              <select className="field col-span-1" value={draft.gender ?? ''} onChange={e => setDraft({ ...draft, gender: e.target.value })}>
                <option value="">Gender</option>
                <option>Female</option><option>Male</option><option>Not specified</option>
              </select>
            </div>
            <div className="flex justify-end gap-2 mt-5">
              <button onClick={() => setShowCreate(false)} className="btn btn-ghost">Cancel</button>
              <button onClick={create} disabled={busy} className="btn btn-primary">{busy ? 'Saving…' : 'Register'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
