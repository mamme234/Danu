import { useEffect, useState } from 'react'
import supabase from '../../lib/supabaseClient'
import { useApp } from '../../context/AppState'
import { PageHeader } from '../../components/UI'

export default function PatientProfile() {
  const { user } = useApp()
  const [profile, setProfile] = useState<any | null>(null)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  useEffect(() => {
    if (!user) return
    supabase.from('user_profiles').select('*').eq('id', user.id).maybeSingle().then(({ data }) => setProfile(data))
  }, [user])

  async function save(e: React.FormEvent) {
    e.preventDefault()
    if (!user) return
    setSaving(true)
    setMessage(null)
    const { error } = await supabase.from('user_profiles').update({
      full_name: profile.full_name,
    }).eq('id', user.id)
    setSaving(false)
    setMessage(error ? error.message : 'Profile updated.')
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Profile" subtitle="Manage your personal information." />
      <form className="card p-6 space-y-4 max-w-lg" onSubmit={save}>
        <div><label className="label">Full name</label><input className="field" value={profile?.full_name ?? ''} onChange={e => setProfile({ ...profile, full_name: e.target.value })} /></div>
        <div><label className="label">Email</label><input className="field" disabled value={user?.email ?? ''} /></div>
        <button className="btn btn-primary">{saving ? 'Saving…' : 'Save changes'}</button>
        {message && <div className={`alert ${message.includes('updated') ? 'alert-success' : 'alert-error'}`}>{message}</div>}
      </form>
    </div>
  )
}
