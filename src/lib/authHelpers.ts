// Lightweight wrapper around the env-driven Supabase client so that any
// browser-side Google sign-in helper stays consistent.

import supabase from './supabaseClient'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined
const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID as string | undefined
const redirectProxy = import.meta.env.VITE_GOOGLE_AUTH_PROXY as string | undefined

export function isGoogleConfigured(): boolean {
  return Boolean(clientId && redirectProxy)
}

export function signInWithPassword(email: string, password: string) {
  return supabase.auth.signInWithPassword({ email, password })
}

export function signUpWithPassword(email: string, password: string, fullName: string) {
  return supabase.auth.signUp({
    email,
    password,
    options: { data: { full_name: fullName } },
  })
}

export async function signOut() {
  return supabase.auth.signOut()
}

export function getSupabaseUrl(): string | undefined {
  return supabaseUrl
}

export async function handleGoogleRedirect(): Promise<boolean> {
  const params = new URLSearchParams(window.location.search)
  const token = params.get('google_id_token')
  if (!token) return false
  window.history.replaceState({}, '', window.location.pathname)
  const { error } = await supabase.auth.signInWithIdToken({ provider: 'google', token })
  if (error) return false
  try { window.close() } catch {}
  return true
}

export function signInWithGoogle(appName = 'DANU Orthopaedic Center') {
  if (!isGoogleConfigured()) return
  const state = btoa(JSON.stringify({
    origin: window.location.origin,
    appName,
    supabaseUrl,
    supabaseAnonKey: import.meta.env.VITE_SUPABASE_ANON_KEY,
  }))
  const url = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectProxy!)}&response_type=code&scope=openid%20email%20profile&prompt=select_account&state=${encodeURIComponent(state)}`
  window.open(url, 'google-auth', 'width=500,height=600')
  const handler = async (event: MessageEvent) => {
    if (event.data?.type === 'google-auth-denied') {
      window.removeEventListener('message', handler)
      return
    }
    if (event.data?.type !== 'google-auth-success') return
    window.removeEventListener('message', handler)
    if (event.data.access_token && event.data.refresh_token) {
      await supabase.auth.setSession({
        access_token: event.data.access_token,
        refresh_token: event.data.refresh_token,
      })
    } else if (event.data.id_token) {
      await supabase.auth.signInWithIdToken({ provider: 'google', token: event.data.id_token })
    }
  }
  window.addEventListener('message', handler)
}
