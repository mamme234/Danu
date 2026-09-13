import { useEffect, useState } from 'react'
import { api, todayISO } from '../../lib/api'
import type { Appointment, Visit, Patient } from '../../lib/types'
import { PageHeader, StatusBadge } from '../../components/UI'

export default function DoctorDashboard() {
  const [appts, setAppts] = useState<Appointment[] | null>(null)
  const [active, setActive] = useState<Appointment | null>(null)
  const [patient, setPatient] = useState<Patient | null>(null)
  const [consultation, setConsultation] = useState('')
  const [diagnosis, setDiagnosis] = useState('')
  const [treatment, setTreatment] = useState('')
  const [followUp, setFollowUp] = useState('')

  async function refresh() {
    const r = await api.get<Appointment[]>(`appointments?date=${todayISO()}`)
    if (r.data) setAppts(r.data)
  }
  useEffect(() => { refresh() }, [])

  async function selectAppointment(a: Appointment) {
    setActive(a)
    setConsultation(''); setDiagnosis(''); setTreatment(''); setFollowUp('')
    const r = await api.get<Patient[]>(`patients?q=${a.patient_id}`)
    if (r.data && r.data.length > 0) setPatient(r.data[0])
    // Load existing visit
    const v = await api.get<Visit[]>(`visits?patient_id=${a.patient_id}`)
    if (v.data) {
      const found = v.data.find(x => x.appointment_id === a.id)
      if (found) {
        setConsultation(found.consultation_notes ?? '')
        setDiagnosis(found.diagnosis ?? '')
        setTreatment(found.treatment_plan ?? '')
        setFollowUp(found.follow_up_date ?? '')
      }
    }
  }

  async function complete() {
    if (!active) return
    const r = await api.post('visits', {
      appointment_id: active.id,
      patient_id: active.patient_id,
      consultation_notes: consultation,
      diagnosis,
      treatment_plan: treatment,
      follow_up_date: followUp || null,
      completed_at: new Date().toISOString(),
    })
    if (r.error) { alert(r.error.message); return }
    setActive(null); setPatient(null); refresh()
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Doctor dashboard" subtitle="Today's consultations and visit notes." />

      <section className="grid md:grid-cols-3 gap-5">
        <div className="card p-4 md:col-span-1">
          <h3 className="font-semibold text-navy-800">Today's queue</h3>
          <ul className="mt-3 divide-y divide-slate-100">
            {(appts ?? []).map(a => (
              <li key={a.id}>
                <button onClick={() => selectAppointment(a)} className={`w-full text-left py-3 ${active?.id === a.id ? 'bg-teal-50 -mx-4 px-4' : ''}`}>
                  <div className="flex justify-between">
                    <span className="font-semibold text-navy-800">{a.time}</span>
                    <StatusBadge status={a.status} />
                  </div>
                  <div className="text-xs text-slate-500 line-clamp-1">{a.reason}</div>
                </button>
              </li>
            ))}
            {!appts && <li className="text-sm text-slate-500 py-3">Loading…</li>}
            {appts && appts.length === 0 && <li className="text-sm text-slate-500 py-3">No appointments today.</li>}
          </ul>
        </div>

        <div className="card p-5 md:col-span-2">
          {!active && <p className="text-sm text-slate-500">Select an appointment to enter consultation notes.</p>}
          {active && patient && (
            <div>
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-xs uppercase tracking-wider text-teal-600">Patient</p>
                  <h3 className="text-lg font-semibold text-navy-800">{patient.first_name} {patient.last_name}</h3>
                  <p className="text-xs text-slate-500">{patient.code} • {patient.phone}</p>
                </div>
                <StatusBadge status={active.status} />
              </div>

              <div className="grid md:grid-cols-2 gap-3 mt-5">
                <div><label className="label">Consultation notes</label><textarea className="field" value={consultation} onChange={e => setConsultation(e.target.value)} /></div>
                <div><label className="label">Diagnosis (working)</label><textarea className="field" value={diagnosis} onChange={e => setDiagnosis(e.target.value)} /></div>
                <div><label className="label">Treatment plan</label><textarea className="field" value={treatment} onChange={e => setTreatment(e.target.value)} /></div>
                <div><label className="label">Follow-up date</label><input type="date" className="field" value={followUp} onChange={e => setFollowUp(e.target.value)} /></div>
              </div>

              <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg p-3 mt-4">
                Reminder: clinical content is private. Only authorised clinical
                roles may view or modify records.
              </p>
              <div className="flex justify-end gap-2 mt-5">
                <button className="btn btn-ghost" onClick={() => setActive(null)}>Close</button>
                <button className="btn btn-primary" onClick={complete}>Complete visit</button>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
