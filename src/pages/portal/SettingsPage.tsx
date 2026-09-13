import { useEffect, useState } from 'react'
import { api } from '../../lib/api'
import { PageHeader, Input } from '../../components/UI'

export default function SettingsPage() {
  const [settings, setSettings] = useState<Record<string, any> | null>(null)
  const [saved, setSaved] = useState<string | null>(null)

  useEffect(() => { api.get<any>('settings').then(r => { if (r.data) setSettings(r.data) }) }, [])

  async function save(key: string, value: any) {
    const r = await api.put('admin', { kind: 'settings.update', payload: { key, value } })
    setSaved(r.error ? r.error.message : 'Saved.')
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Settings" subtitle="Clinic-wide preferences." />
      <section className="card p-6 max-w-2xl space-y-4">
        <div>
          <label className="label">Clinic name</label>
          <Input defaultValue="DANU Orthopaedic Center" onBlur={e => save('clinic.name', e.target.value)} />
        </div>
        <div>
          <label className="label">Phone (public)</label>
          <Input defaultValue="(to be confirmed)" onBlur={e => save('clinic.phone', e.target.value)} />
        </div>
        <div>
          <label className="label">Email (public)</label>
          <Input defaultValue="info@danuorthopaedic.example" onBlur={e => save('clinic.email', e.target.value)} />
        </div>
        <div>
          <label className="label">Opening hours (public)</label>
          <Input defaultValue="Mon–Sat 08:00–18:00 (to be confirmed)" onBlur={e => save('clinic.hours', e.target.value)} />
        </div>
        {saved && <div className="alert alert-success">{saved}</div>}
      </section>
    </div>
  )
}
