import { useEffect, useMemo, useState } from 'react'
import { api } from '../../lib/api'
import type { Doctor, Service } from '../../lib/types'
import { useApp } from '../../context/AppState'
import supabase from '../../lib/supabaseClient'

interface PublicPayload { services: Service[]; doctors: Doctor[] }

export default function AppointmentPage() {
  const { user } = useApp()
  const [data, setData] = useState<PublicPayload | null>(null)
  const [patientId, setPatientId] = useState<string>('')
  const [serviceId, setServiceId] = useState<string>('')
  const [doctorId, setDoctorId] = useState<string>('')
  const [date, setDate] = useState<string>(() => new Date().toISOString().slice(0, 10))
  const [time, setTime] = useState<string>('')
  const [reason, setReason] = useState<string>('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [channel, setChannel] = useState<'ONLINE' | 'WALK_IN' | 'PHONE'>('ONLINE')
  const [submitting, setSubmitting] = useState(false)
  const [result, setResult] = useState<{ ok: boolean; message: string } | null>(null)

  useEffect(() => {
    api.get<PublicPayload>('public').then(r => { if (r.data) setData(r.data) })
  }, [])

  useEffect(() => {
    if (!user) return
    setEmail(user.email)
    const meta = user as unknown as { full_name?: string }
    const full = meta.full_name ?? ''
    const parts = full.split(/\s+/)
    if (parts.length >= 2) { setFirstName(parts[0]); setLastName(parts.slice(1).join(' ')) }
    void supabase.from('patients').select('id').eq('user_id', user.id).maybeSingle().then(({ data }) => {
      if (data?.id) setPatientId(data.id)
    })
  }, [user])

  const services = data?.services ?? []
  const doctors  = data?.doctors ?? []

  const selectedService = services.find(s => s.id === serviceId)
  const selectedDoctor = doctors.find(d => d.id === doctorId)

  const timeSlots = useMemo(() => {
    const slots: string[] = []
    const start = 8 * 60 // 8:00
    const end = 18 * 60  // 18:00
    const interval = selectedService?.duration_minutes ?? 30
    for (let t = start; t < end; t += interval) {
      slots.push(`${Math.floor(t / 60).toString().padStart(2, '0')}:${(t % 60).toString().padStart(2, '0')}`)
    }
    return slots
  }, [selectedService])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    setResult(null)
    try {
      let pid = patientId
      if (!pid) {
        const { data, error } = await supabase.from('patients').insert({
          code: `DANU-P-${Date.now().toString().slice(-6)}`,
          first_name: firstName || (user?.full_name?.split(' ')[0] ?? 'Guest'),
          last_name: lastName || (user?.full_name?.split(' ').slice(1).join(' ') ?? 'Patient'),
          email,
          phone: phone || null,
        }).select().single()
        if (error) throw error
        pid = data.id
        setPatientId(pid)
      }
      const res = await api.post<any>('appointments', {
        patient_id: pid,
        service_id: serviceId,
        doctor_id: doctorId || null,
        date,
        time,
        reason,
        channel,
      })
      if (res.error) {
        setResult({ ok: false, message: res.error.message })
      } else {
        setResult({ ok: true, message: 'Your appointment request has been received. Reception will confirm your slot shortly.' })
      }
    } catch (e) {
      setResult({ ok: false, message: e instanceof Error ? e.message : 'Could not submit request.' })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <header className="mb-8">
        <p className="text-xs font-bold uppercase tracking-wider text-teal-600">Appointment</p>
        <h1 className="text-3xl md:text-4xl font-display font-extrabold text-navy-800 mt-1">Book an appointment</h1>
        <p className="mt-3 text-slate-600">
          Online requests are pending until reception confirms your slot — you
          will be notified through the patient portal.
        </p>
      </header>

      <form onSubmit={handleSubmit} className="card p-6 md:p-8 space-y-5">
        <div>
          <label className="label">Service</label>
          <select className="field" required value={serviceId} onChange={e => setServiceId(e.target.value)}>
            <option value="">Select a service</option>
            {services.map(s => (
              <option key={s.id} value={s.id}>{s.name} — {s.category}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="label">Doctor (optional)</label>
          <select className="field" value={doctorId} onChange={e => setDoctorId(e.target.value)}>
            <option value="">Any available doctor</option>
            {doctors.map(d => (<option key={d.id} value={d.id}>{d.name} — {d.specialty}</option>))}
          </select>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="label">Date</label>
            <input type="date" className="field" required min={new Date().toISOString().slice(0, 10)} value={date} onChange={e => setDate(e.target.value)} />
          </div>
          <div>
            <label className="label">Time</label>
            <select className="field" required value={time} onChange={e => setTime(e.target.value)}>
              <option value="">Select a time</option>
              {timeSlots.map(t => (<option key={t} value={t}>{t}</option>))}
            </select>
          </div>
        </div>

        <div>
          <label className="label">Reason for visit</label>
          <textarea className="field" rows={3} required value={reason} onChange={e => setReason(e.target.value)} placeholder="Briefly describe the concern" />
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div><label className="label">First name</label><input className="field" value={firstName} onChange={e => setFirstName(e.target.value)} /></div>
          <div><label className="label">Last name</label><input className="field" value={lastName} onChange={e => setLastName(e.target.value)} /></div>
          <div><label className="label">Phone</label><input className="field" value={phone} onChange={e => setPhone(e.target.value)} /></div>
          <div><label className="label">Email</label><input className="field" type="email" value={email} onChange={e => setEmail(e.target.value)} /></div>
        </div>

        <div>
          <label className="label">Booking channel</label>
          <select className="field" value={channel} onChange={e => setChannel(e.target.value as any)}>
            <option value="ONLINE">Online (this form)</option>
            <option value="PHONE">Phone</option>
            <option value="WALK_IN">Walk-in</option>
          </select>
        </div>

        <div className="flex items-center gap-3">
          <button type="submit" disabled={submitting} className="btn btn-primary disabled:opacity-60">
            {submitting ? 'Submitting…' : 'Request appointment'}
          </button>
          {selectedService && <span className="text-xs text-slate-500">{selectedService.duration_minutes} min session</span>}
          {selectedDoctor && <span className="text-xs text-slate-500">Doctor: {selectedDoctor.name}</span>}
        </div>

        {result && (
          <div className={`alert ${result.ok ? 'alert-success' : 'alert-error'}`}>
            {result.message}
          </div>
        )}
      </form>
    </div>
  )
}
