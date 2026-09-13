import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useApp } from '../../context/AppState'
import { signInWithGoogle, signInWithPassword, signUpWithPassword, isGoogleConfigured } from '../../lib/authHelpers'

export default function LoginPage() {
  const navigate = useNavigate()
  const [mode, setMode] = useState<'login' | 'signup'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { setDemoMode, demoMode } = useApp()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      if (mode === 'login') {
        const { error } = await signInWithPassword(email, password)
        if (error) setError(error.message)
        else navigate('/patient')
      } else {
        const { error } = await signUpWithPassword(email, password, name)
        if (error) setError(error.message)
        else navigate('/patient')
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unexpected error.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-16">
      <div className="card w-full max-w-md p-8">
        <Link to="/" className="flex items-center gap-2 mb-6">
          <svg width="36" height="36" viewBox="0 0 64 64"><rect width="64" height="64" rx="14" fill="#0a2540"/><path d="M32 15a6 6 0 016 6v5h5a6 6 0 010 12h-5v5a6 6 0 01-12 0v-5h-5a6 6 0 010-12h5v-5a6 6 0 016-6z" fill="#14b8a6"/></svg>
          <div>
            <div className="font-display font-extrabold text-navy-800 text-lg leading-none">DANU</div>
            <div className="text-[9px] tracking-[.22em] font-bold uppercase text-teal-600 mt-1">Orthopaedic Center</div>
          </div>
        </Link>
        <h1 className="font-display text-2xl font-extrabold text-navy-800">{mode === 'login' ? 'Sign in' : 'Create your account'}</h1>
        <p className="text-sm text-slate-500 mt-1">{mode === 'login' ? 'Sign in to your patient or staff account.' : 'Register to book appointments and access your records.'}</p>

        {isGoogleConfigured() && (
          <>
            <button type="button" onClick={() => signInWithGoogle('DANU Orthopaedic Center')} className="btn btn-ghost w-full mt-6 border-navy-200">
              <span className="font-bold">G</span> Continue with Google
            </button>
            <div className="text-center text-slate-400 my-3 text-xs">or</div>
          </>
        )}

        <form onSubmit={handleSubmit} className="space-y-3">
          {mode === 'signup' && (
            <div><label className="label">Full name</label><input className="field" value={name} onChange={e => setName(e.target.value)} required /></div>
          )}
          <div><label className="label">Email</label><input className="field" type="email" value={email} onChange={e => setEmail(e.target.value)} required /></div>
          <div><label className="label">Password</label><input className="field" type="password" value={password} onChange={e => setPassword(e.target.value)} required minLength={6} /></div>
          {error && <div className="alert alert-error">{error}</div>}
          <button className="btn btn-primary w-full" disabled={loading}>{loading ? 'Working…' : (mode === 'login' ? 'Sign in' : 'Create account')}</button>
        </form>

        <div className="mt-6 text-sm text-slate-600 flex items-center justify-between">
          <button type="button" className="text-teal-600 hover:underline" onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}>
            {mode === 'login' ? 'Create account' : 'Already have an account?'}
          </button>
          <label className="flex items-center gap-2 text-xs">
            <input type="checkbox" checked={demoMode} onChange={e => setDemoMode(e.target.checked)} />
            Demo mode
          </label>
        </div>
      </div>
    </div>
  )
}
