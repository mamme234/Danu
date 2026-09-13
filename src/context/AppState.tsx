// Top-level state provider for the DANU platform. Holds user profile, role,
// notifications counter, demo-mode flag, and the loader flag.

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import supabase from '../lib/supabaseClient'
import type { AppRole, AuditLog, NotificationItem, UserProfile } from '../lib/types'

interface AppContextValue {
  user: UserProfile | null
  role: AppRole | null
  demoMode: boolean
  setDemoMode: (v: boolean) => void
  loading: boolean
  notifications: NotificationItem[]
  refreshNotifications: () => Promise<void>
  signOut: () => Promise<void>
}

const AppContext = createContext<AppContextValue | undefined>(undefined)

export function AppProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null)
  const [role, setRole] = useState<AppRole | null>(null)
  const [notifications, setNotifications] = useState<NotificationItem[]>([])
  const [loading, setLoading] = useState(true)
  const [demoMode, setDemoMode] = useState<boolean>(() => {
    try { return localStorage.getItem('danu:demoMode') === '1' } catch { return true }
  })

  useEffect(() => {
    try { localStorage.setItem('danu:demoMode', demoMode ? '1' : '0') } catch {}
  }, [demoMode])

  const loadProfile = useCallback(async () => {
    const { data } = await supabase.auth.getUser()
    const u = data.user
    if (!u) { setUser(null); setRole(null); return }
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('id, email, full_name, role, active, created_at')
      .eq('id', u.id)
      .maybeSingle()
    const next: UserProfile = {
      id: u.id,
      email: u.email ?? '',
      full_name: profile?.full_name ?? (u.user_metadata?.full_name as string) ?? '',
      role: (profile?.role as AppRole) ?? 'PATIENT',
      active: profile?.active ?? true,
      created_at: profile?.created_at ?? new Date().toISOString(),
    }
    setUser(next)
    setRole(next.role)
    try { localStorage.setItem('danu:lastRole', next.role) } catch {}
  }, [])

  const refreshNotifications = useCallback(async () => {
    if (!user) return
    const { data } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(15)
    setNotifications((data as NotificationItem[] | null) ?? [])
  }, [user])

  useEffect(() => {
    let mounted = true
    ;(async () => {
      await loadProfile()
      if (mounted) setLoading(false)
    })()
    const sub = supabase.auth.onAuthStateChange(() => { loadProfile() })
    return () => {
      mounted = false
      sub.data.subscription.unsubscribe()
    }
  }, [loadProfile])

  useEffect(() => {
    if (user) refreshNotifications()
  }, [user, refreshNotifications])

  const value = useMemo<AppContextValue>(() => ({
    user,
    role,
    demoMode,
    setDemoMode,
    loading,
    notifications,
    refreshNotifications,
    signOut: async () => { await supabase.auth.signOut(); setUser(null); setRole(null) },
  }), [user, role, demoMode, loading, notifications, refreshNotifications])

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used inside <AppProvider>')
  return ctx
}

// Audit log type re-export (used by admin page)
export type { AuditLog }
