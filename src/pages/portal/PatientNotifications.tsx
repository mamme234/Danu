import { useEffect, useState } from 'react'
import { api, formatDateTime } from '../../lib/api'
import type { NotificationItem } from '../../lib/types'
import { PageHeader, EmptyState } from '../../components/UI'

export default function PatientNotifications() {
  const [items, setItems] = useState<NotificationItem[] | null>(null)

  async function refresh() {
    const r = await api.get<NotificationItem[]>('notifications')
    if (r.data) setItems(r.data)
  }
  useEffect(() => { refresh() }, [])

  async function markRead(id: string) {
    await api.put('notifications', { id })
    refresh()
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Notifications" subtitle="In-app messages about your appointments and billing." />
      {!items && <p className="text-sm text-slate-500">Loading…</p>}
      {items && items.length === 0 && <EmptyState title="No notifications" message="You will be notified here about appointments, payments and reminders." />}
      {items && items.length > 0 && (
        <ul className="card divide-y divide-slate-100">
          {items.map(n => (
            <li key={n.id} className={`p-4 ${n.read ? 'opacity-70' : ''}`}>
              <div className="flex justify-between items-start gap-3">
                <div>
                  <div className="font-semibold text-navy-800 text-sm">{n.title}</div>
                  <div className="text-sm text-slate-600">{n.message}</div>
                  <div className="text-[11px] text-slate-500 mt-1">{formatDateTime(n.created_at)}</div>
                </div>
                {!n.read && <button onClick={() => markRead(n.id)} className="btn btn-ghost text-xs">Mark read</button>}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
