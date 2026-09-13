// Shared authentication & RBAC helpers for API routes. Every protected
// handler calls `withAuth(req, role, handler)` so role enforcement is uniform
// and audit logging is automatic.

import type { IncomingMessage, ServerResponse } from 'http'
import supabase from '../db-client.js'

export type Handler = (req: IncomingMessage, res: ServerResponse, ctx: AuthContext) => Promise<unknown> | unknown

export interface AuthContext {
  user: { id: string; email: string; role: string; full_name?: string }
  supabase: typeof supabase
}

const ALLOWED_ORIGINS = (process.env.ALLOWED_ORIGINS ?? '*').split(',').map(s => s.trim()) || ['*']

export function setCors(res: ServerResponse) {
  const origin = ALLOWED_ORIGINS.join(',') || '*'
  res.setHeader('Access-Control-Allow-Origin', origin)
  res.setHeader('Vary', 'Origin')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
}

export async function audit(action: string, resource: string, actor: { id: string | null; email: string }, result: 'SUCCESS' | 'DENIED' | 'ERROR', meta: Record<string, unknown> | null = null) {
  try {
    await supabase.from('audit_logs').insert({
      actor_id: actor.id,
      actor_email: actor.email,
      action,
      resource,
      result,
      meta,
    })
  } catch (e) {
    // eslint-disable-next-line no-console
    console.warn('[audit] failed to log:', (e as Error).message)
  }
}

export async function readBody<T = unknown>(req: IncomingMessage): Promise<T> {
  return new Promise((resolve, reject) => {
    let raw = ''
    req.on('data', chunk => { raw += chunk })
    req.on('end', () => {
      if (!raw) return resolve({} as T)
      try {
        resolve(JSON.parse(raw))
      } catch (e) {
        reject(e)
      }
    })
    req.on('error', err => reject(err))
  })
}

export function deny(res: ServerResponse, status: number, message: string) {
  res.statusCode = status
  res.setHeader('Content-Type', 'application/json')
  res.end(JSON.stringify({ error: message }))
}

// Per-role permissions mirrored from `src/lib/supabase.ts`
const ROLE_PERMS: Record<string, string[]> = {
  SUPER_ADMIN: [
    'patient.read', 'patient.write',
    'record.read', 'record.write',
    'appointment.read', 'appointment.write',
    'billing.read', 'billing.write',
    'content.read', 'content.write',
    'staff.write',
    'audit.read',
    'reports.read',
  ],
  ADMIN: [
    'patient.read', 'patient.write',
    'appointment.read', 'appointment.write',
    'billing.read',
    'content.read', 'content.write',
    'staff.write',
    'audit.read',
    'reports.read',
  ],
  DOCTOR: ['patient.read', 'patient.write', 'record.read', 'record.write', 'appointment.read', 'appointment.write', 'reports.read'],
  NURSE: ['patient.read', 'record.read', 'record.write', 'appointment.read'],
  RECEPTIONIST: ['patient.read', 'patient.write', 'appointment.read', 'appointment.write'],
  ACCOUNTANT: ['patient.read', 'billing.read', 'billing.write', 'reports.read'],
  CONTENT_MANAGER: ['content.read', 'content.write'],
  PATIENT: ['appointment.read', 'record.read'],
}

export function hasPermission(role: string, perm: string): boolean {
  return ROLE_PERMS[role]?.includes(perm) ?? false
}

export interface AuthOptions {
  permission?: string
  requireUser?: boolean
}

/**
 * Wraps a route handler with:
 * - CORS headers
 * - OPTIONS short-circuit
 * - JWT verification using the user's bearer token (so RLS policies apply)
 * - Role-based permission gate when `permission` is provided
 * - Automatic audit logging helper
 */
export function withAuth(opts: AuthOptions, handler: Handler) {
  return async (req: IncomingMessage, res: ServerResponse) => {
    setCors(res)
    if (req.method === 'OPTIONS') {
      res.statusCode = 204
      return res.end()
    }

    let actor = { id: null as string | null, email: 'anonymous' }
    let scoped = supabase

    try {
      const auth = (req.headers.authorization || req.headers.Authorization) as string | undefined
      const token = auth?.startsWith('Bearer ') ? auth.slice(7) : null
      if (token) {
        const { createClient } = await import('@supabase/supabase-js')
        const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || 'anon'
        scoped = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.VITE_SUPABASE_URL || '', anon, {
          global: { headers: { Authorization: `Bearer ${token}` } },
          auth: { persistSession: false, autoRefreshToken: false },
        })
        const { data, error } = await scoped.auth.getUser(token)
        if (!error && data?.user) {
          actor.id = data.user.id
          actor.email = data.user.email ?? 'unknown'
          const { data: profile } = await scoped.from('user_profiles').select('role, full_name').eq('id', data.user.id).single()
          const ctx: AuthContext = {
            user: {
              id: data.user.id,
              email: actor.email,
              role: (profile?.role as string) ?? 'PATIENT',
              full_name: profile?.full_name as string | undefined,
            },
            supabase: scoped,
          }
          if (opts.permission && !hasPermission(ctx.user.role, opts.permission)) {
            await audit(opts.permission, `route:${req.url}`, actor, 'DENIED')
            return deny(res, 403, `Forbidden: missing permission ${opts.permission}.`)
          }
          try {
            await handler(req, res, ctx)
          } catch (e) {
            await audit('handler_error', `route:${req.url}`, actor, 'ERROR', { message: (e as Error).message })
            return deny(res, 500, (e as Error).message)
          }
          return
        }
      }
      // No token / invalid token
      if (opts.requireUser) {
        await audit('unauth', `route:${req.url}`, actor, 'DENIED')
        return deny(res, 401, 'Unauthorized')
      }
      const ctx: AuthContext = {
        user: { id: '', email: 'anonymous', role: 'PUBLIC' },
        supabase: scoped,
      }
      try {
        await handler(req, res, ctx)
      } catch (e) {
        return deny(res, 500, (e as Error).message)
      }
    } catch (e) {
      return deny(res, 500, (e as Error).message)
    }
  }
}
