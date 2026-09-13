export function classNames(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(' ')
}

export function initials(name: string | undefined | null): string {
  if (!name) return '·'
  const parts = name.trim().split(/\s+/)
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

export function appointmentStatusColor(status: string): string {
  switch (status) {
    case 'REQUESTED':
      return 'bg-blue-50 text-blue-700 border-blue-200'
    case 'CONFIRMED':
      return 'bg-emerald-50 text-emerald-700 border-emerald-200'
    case 'CHECKED_IN':
      return 'bg-violet-50 text-violet-700 border-violet-200'
    case 'RESCHEDULED':
      return 'bg-amber-50 text-amber-800 border-amber-200'
    case 'COMPLETED':
      return 'bg-slate-100 text-slate-700 border-slate-200'
    case 'NO_SHOW':
      return 'bg-red-50 text-red-700 border-red-200'
    case 'CANCELLED':
      return 'bg-red-50 text-red-700 border-red-200'
    default:
      return 'bg-slate-50 text-slate-700 border-slate-200'
  }
}

export function invoiceStatusColor(status: string): string {
  switch (status) {
    case 'PAID':
      return 'bg-emerald-50 text-emerald-700 border-emerald-200'
    case 'PARTIALLY_PAID':
      return 'bg-amber-50 text-amber-700 border-amber-200'
    case 'UNPAID':
      return 'bg-rose-50 text-rose-700 border-rose-200'
    case 'CANCELLED':
      return 'bg-slate-100 text-slate-600 border-slate-200'
    default:
      return 'bg-slate-50 text-slate-700 border-slate-200'
  }
}
