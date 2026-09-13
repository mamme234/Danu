import type { Permission } from './supabase'
import { supabase, roleHas, type Role } from './supabase'

export type ApiOk<T> = { data: T; error: null }
export type ApiErr = { data: null; error: { status: number; message: string } }
export type ApiResult<T> = ApiOk<T> | ApiErr

async function call<T>(path: string, init: RequestInit = {}): Promise<ApiResult<T>> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(init.headers as Record<string, string> | undefined),
  }
  const { data: sessionData } = await supabase.auth.getSession()
  const token = sessionData.session?.access_token
  if (token) headers.Authorization = `Bearer ${token}`

  try {
    const res = await fetch(`/api/${path.replace(/^\//, '')}`, { ...init, headers })
    const body = await res.json().catch(() => null)
    if (!res.ok) {
      return { data: null, error: { status: res.status, message: body?.error ?? `HTTP ${res.status}` } }
    }
    return { data: body as T, error: null }
  } catch (e) {
    return { data: null, error: { status: 0, message: e instanceof Error ? e.message : 'Network error' } }
  }
}

export const api = {
  get: <T>(path: string) => call<T>(path),
  post: <T>(path: string, body: unknown) =>
    call<T>(path, { method: 'POST', body: JSON.stringify(body) }),
  put: <T>(path: string, body: unknown) =>
    call<T>(path, { method: 'PUT', body: JSON.stringify(body) }),
  del: <T>(path: string, body: unknown) =>
    call<T>(path, { method: 'DELETE', body: JSON.stringify(body) }),
}

export function requireClientPerm(perm: Permission): { ok: true } | { ok: false; reason: string } {
  // Light client-side hint. Server is still the source of truth.
  // Roles & tokens aren't loaded synchronously here; this helper is intentionally
  // a thin wrapper for shared semantics when used together with the role cache.
  return roleHas(localStorage.getItem('danu:lastRole') as Role, perm)
    ? { ok: true }
    : { ok: false, reason: 'Insufficient permission for this action.' }
}

export function formatETB(amount: number): string {
  return new Intl.NumberFormat('en-ET', { style: 'currency', currency: 'ETB' }).format(amount)
}

export function formatDateTime(iso: string | Date | null | undefined, opts?: Intl.DateTimeFormatOptions): string {
  if (!iso) return '—'
  const d = typeof iso === 'string' ? new Date(iso) : iso
  if (Number.isNaN(d.getTime())) return '—'
  return d.toLocaleString('en-ET', opts ?? { dateStyle: 'medium', timeStyle: 'short' })
}

export function formatDate(iso: string | Date | null | undefined): string {
  if (!iso) return '—'
  const d = typeof iso === 'string' ? new Date(iso) : iso
  if (Number.isNaN(d.getTime())) return '—'
  return d.toLocaleDateString('en-ET', { dateStyle: 'medium' })
}

export function todayISO(offsetDays = 0): string {
  const d = new Date()
  d.setDate(d.getDate() + offsetDays)
  return d.toISOString().slice(0, 10)
}
