import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined
const anon = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined

if (!url || !anon) {
  // Surface the issue loudly in dev; the API layer still falls back gracefully
  // to JSON responses so the public site never crashes before the env is wired.
  // eslint-disable-next-line no-console
  console.warn('[danu] Supabase env not configured. Authenticated flows are disabled until then.')
}

export const supabase = createClient(url ?? 'https://invalid.invalid', anon ?? 'invalid', {
  auth: { persistSession: true, autoRefreshToken: true },
})

export type Role =
  | 'SUPER_ADMIN'
  | 'ADMIN'
  | 'DOCTOR'
  | 'NURSE'
  | 'RECEPTIONIST'
  | 'ACCOUNTANT'
  | 'CONTENT_MANAGER'
  | 'PATIENT'

export type Permission =
  | 'patient.read'
  | 'patient.write'
  | 'record.read'
  | 'record.write'
  | 'appointment.read'
  | 'appointment.write'
  | 'billing.read'
  | 'billing.write'
  | 'content.read'
  | 'content.write'
  | 'staff.write'
  | 'audit.read'
  | 'reports.read'

export const ROLE_PERMS: Record<Role, Permission[]> = {
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
  DOCTOR: [
    'patient.read', 'patient.write',
    'record.read', 'record.write',
    'appointment.read', 'appointment.write',
    'reports.read',
  ],
  NURSE: [
    'patient.read',
    'record.read', 'record.write',
    'appointment.read',
  ],
  RECEPTIONIST: [
    'patient.read', 'patient.write',
    'appointment.read', 'appointment.write',
  ],
  ACCOUNTANT: [
    'patient.read',
    'billing.read', 'billing.write',
    'reports.read',
  ],
  CONTENT_MANAGER: ['content.read', 'content.write'],
  PATIENT: ['appointment.read', 'record.read'],
}

export function roleHas(role: Role | undefined, perm: Permission): boolean {
  if (!role) return false
  return ROLE_PERMS[role]?.includes(perm) ?? false
}
