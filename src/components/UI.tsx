// Tiny primitives shared by the portal pages (loaders, badges, etc.).
import type { ReactNode } from 'react'

export function Spinner({ size = 24 }: { size?: number }) {
  return (
    <div className="flex items-center justify-center">
      <div
        className="rounded-full border-[3px] border-slate-200 border-t-teal-500 animate-spin"
        style={{ width: size, height: size }}
        role="status"
        aria-label="Loading"
      />
    </div>
  )
}

export function SkeletonRow({ columns = 4 }: { columns?: number }) {
  return (
    <tr>
      {Array.from({ length: columns }).map((_, i) => (
        <td key={i} className="px-3 py-2.5 border-b border-slate-100">
          <div className="h-3 rounded skeleton" />
        </td>
      ))}
    </tr>
  )
}

export function EmptyState({ title, message, action }: { title: string; message: string; action?: ReactNode }) {
  return (
    <div className="card p-10 text-center">
      <h3 className="text-lg font-semibold text-navy-800">{title}</h3>
      <p className="text-slate-500 mt-2 text-sm">{message}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  )
}

export function Alert({ kind = 'info', children }: { kind?: 'info' | 'warn' | 'error' | 'success'; children: ReactNode }) {
  return (
    <div className={`alert alert-${kind}`}>
      {children}
    </div>
  )
}

export function Badge({ status }: { status: string }) {
  const cls =
    status === 'PUBLISHED' ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
      : status === 'DRAFT' ? 'bg-amber-50 text-amber-800 border-amber-200'
      : status === 'ARCHIVED' ? 'bg-slate-100 text-slate-700 border-slate-200'
      : 'bg-slate-100 text-slate-700 border-slate-200'
  return <span className={`badge ${cls}`}>{status}</span>
}

export function PageHeader({ title, subtitle, actions }: { title: string; subtitle?: string; actions?: ReactNode }) {
  return (
    <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-extrabold text-navy-800 font-display">{title}</h1>
        {subtitle && <p className="text-slate-500 mt-1 text-sm">{subtitle}</p>}
      </div>
      {actions && <div className="flex gap-2">{actions}</div>}
    </div>
  )
}

export function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={`field ${props.className ?? ''}`} />
}

export function Textarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...props} className={`field min-h-[80px] ${props.className ?? ''}`} />
}

export function Select(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return <select {...props} className={`field ${props.className ?? ''}`} />
}

export function StatusBadge({ status }: { status: string }) {
  const cls =
    status === 'CONFIRMED' ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
      : status === 'REQUESTED' ? 'bg-blue-50 text-blue-700 border-blue-200'
      : status === 'CANCELLED' ? 'bg-red-50 text-red-700 border-red-200'
      : status === 'COMPLETED' ? 'bg-slate-100 text-slate-700 border-slate-200'
      : status === 'CHECKED_IN' ? 'bg-violet-50 text-violet-700 border-violet-200'
      : status === 'RESCHEDULED' ? 'bg-amber-50 text-amber-800 border-amber-200'
      : status === 'NO_SHOW' ? 'bg-red-50 text-red-700 border-red-200'
      : 'bg-slate-50 text-slate-600 border-slate-200'
  return <span className={`badge ${cls}`}>{status.replace('_', ' ')}</span>
}
