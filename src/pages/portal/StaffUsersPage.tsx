import { useEffect, useState } from 'react'
import supabase from '../../lib/supabaseClient'
import { api } from '../../lib/api'
import { PageHeader, Badge } from '../../components/UI'
import type { UserProfile, AppRole } from '../../lib/types'

const STAFF_ROLES: AppRole[] = ['SUPER_ADMIN', 'ADMIN', 'DOCTOR', 'NURSE', 'RECEPTIONIST', 'ACCOUNTANT', 'CONTENT_MANAGER']

export default function StaffUsersPage() {
  const [users, setUsers] = useState<UserProfile[] | null>(null)

  useEffect(() => { refresh() }, [])

  async function refresh() {
    // We use a raw admin query path. In production this would be a dedicated
    // /api/admin/users endpoint. For simplicity we read via the anon client +
    // RLS bypass (the serverless route already authorizes this).
    const r = await api.get<UserProfile[]>('users')
    if (r.data) setUsers(r.data)
  }

  async function updateRole(id: string, role: AppRole) {
    const r = await api.put('admin', { kind: 'staff.role', payload: { user_id: id, role } })
    if (r.error) alert(r.error.message)
    refresh()
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Staff" subtitle="Roles, status, and access." />
      <section className="card p-5">
        <div className="overflow-x-auto">
          <table className="table-wrap">
            <thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Status</th><th></th></tr></thead>
            <tbody>
              {(users ?? []).map(u => (
                <tr key={u.id}>
                  <td>{u.full_name ?? '—'}</td>
                  <td>{u.email}</td>
                  <td>
                    <select className="field" value={u.role} onChange={e => updateRole(u.id, e.target.value as AppRole)}>
                      {STAFF_ROLES.map(r => (<option key={r} value={r}>{r}</option>))}
                    </select>
                  </td>
                  <td><Badge status={u.active ? 'PUBLISHED' : 'ARCHIVED'} /></td>
                  <td className="text-xs text-slate-500">{new Date(u.created_at).toLocaleDateString('en-ET')}</td>
                </tr>
              ))}
              {!users && <tr><td colSpan={5} className="text-sm text-slate-500">Loading…</td></tr>}
            </tbody>
          </table>
        </div>
        <p className="text-xs text-amber-700 mt-3">Only Super Admins may change roles. All changes are logged in the audit log.</p>
      </section>
    </div>
  )
}
