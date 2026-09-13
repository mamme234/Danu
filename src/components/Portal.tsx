import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppState'
import type { AppRole } from '../lib/types'
import { initials } from '../lib/format'

interface PortalConfig {
  base: string
  title: string
  items: Array<{ to: string; label: string }>
  greeting: string
}

const configs: Partial<Record<AppRole, PortalConfig>> = {
  PATIENT: {
    base: '/patient',
    title: 'Patient portal',
    greeting: 'Welcome back',
    items: [
      { to: '/patient', label: 'Overview' },
      { to: '/patient/appointments', label: 'Appointments' },
      { to: '/patient/invoices', label: 'Invoices' },
      { to: '/patient/notifications', label: 'Notifications' },
      { to: '/patient/profile', label: 'Profile' },
    ],
  },
  DOCTOR: {
    base: '/doctor',
    title: 'Doctor portal',
    greeting: 'Welcome back, Doctor',
    items: [
      { to: '/doctor', label: 'Today' },
      { to: '/doctor/schedule', label: 'Schedule' },
      { to: '/doctor/queue', label: 'Queue' },
      { to: '/doctor/visits', label: 'Visits' },
    ],
  },
  NURSE: {
    base: '/nurse',
    title: 'Nurse portal',
    greeting: 'Nursing dashboard',
    items: [
      { to: '/nurse', label: 'Today' },
      { to: '/nurse/queue', label: 'Queue' },
      { to: '/nurse/preparation', label: 'Preparation' },
    ],
  },
  RECEPTIONIST: {
    base: '/reception',
    title: 'Reception dashboard',
    greeting: 'Reception',
    items: [
      { to: '/reception', label: 'Overview' },
      { to: '/reception/appointments', label: 'Appointments' },
      { to: '/reception/queue', label: 'Waiting queue' },
      { to: '/reception/patients', label: 'Patients' },
    ],
  },
  ACCOUNTANT: {
    base: '/billing',
    title: 'Billing',
    greeting: 'Accounts',
    items: [
      { to: '/billing', label: 'Overview' },
      { to: '/billing/invoices', label: 'Invoices' },
      { to: '/billing/reports', label: 'Reports' },
    ],
  },
  CONTENT_MANAGER: {
    base: '/cms',
    title: 'CMS',
    greeting: 'Content manager',
    items: [
      { to: '/cms', label: 'Overview' },
      { to: '/cms/services', label: 'Services' },
      { to: '/cms/doctors', label: 'Doctors' },
      { to: '/cms/facilities', label: 'Facilities' },
      { to: '/cms/faq', label: 'FAQ' },
      { to: '/cms/articles', label: 'Articles' },
      { to: '/cms/blocks', label: 'Content blocks' },
    ],
  },
  ADMIN: {
    base: '/admin',
    title: 'Admin',
    greeting: 'Administration',
    items: [
      { to: '/admin', label: 'Overview' },
      { to: '/admin/users', label: 'Staff' },
      { to: '/admin/audit', label: 'Audit log' },
      { to: '/admin/settings', label: 'Settings' },
    ],
  },
  SUPER_ADMIN: {
    base: '/admin',
    title: 'Super Admin',
    greeting: 'Super Administration',
    items: [
      { to: '/admin', label: 'Overview' },
      { to: '/admin/users', label: 'Staff' },
      { to: '/admin/audit', label: 'Audit log' },
      { to: '/admin/settings', label: 'Settings' },
    ],
  },
}

interface PortalLayoutProps {
  role: AppRole
}

export function PortalLayout({ role }: PortalLayoutProps) {
  const cfg = configs[role]
  if (!cfg) {
    return <div className="p-8">No portal is configured for role {role}.</div>
  }
  return <Shell cfg={cfg} role={role} />
}

function Shell({ cfg, role }: { cfg: PortalConfig; role: AppRole }) {
  const { user, signOut } = useApp()
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <aside className="hidden lg:flex flex-col w-64 bg-white border-r border-slate-100 px-5 py-6 sticky top-0 h-screen">
        <Link to="/" className="flex items-center gap-2 mb-6">
          <svg width="36" height="36" viewBox="0 0 64 64"><rect width="64" height="64" rx="14" fill="#0a2540"/><path d="M32 15a6 6 0 016 6v5h5a6 6 0 010 12h-5v5a6 6 0 01-12 0v-5h-5a6 6 0 010-12h5v-5a6 6 0 016-6z" fill="#14b8a6"/></svg>
          <div>
            <div className="font-display font-extrabold text-navy-800 text-lg leading-none">DANU</div>
            <div className="text-[9px] tracking-[.22em] font-bold uppercase text-teal-600 mt-1">{cfg.title}</div>
          </div>
        </Link>
        <nav className="space-y-1">
          {cfg.items.map(item => (
            <NavLink key={item.to} to={item.to} end={item.to === cfg.base}
              className={({ isActive }) => `dash-item ${isActive ? 'active' : ''}`}>
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="mt-auto pt-6 border-t border-slate-100">
          <div className="text-xs text-slate-500">Signed in as</div>
          <div className="text-sm font-semibold text-navy-800">{user?.full_name || user?.email}</div>
          <div className="text-[11px] text-teal-600 uppercase tracking-wider mt-1">{role}</div>
          <button className="btn btn-ghost mt-3 w-full justify-center" onClick={async () => { await signOut(); navigate('/') }}>Sign out</button>
        </div>
      </aside>
      <div className="flex-1 min-w-0">
        <header className="bg-white border-b border-slate-100 sticky top-0 z-20">
          <div className="px-4 md:px-8 py-3 flex items-center justify-between gap-3">
            <div className="lg:hidden flex items-center gap-2">
              <Link to="/" className="font-display font-extrabold text-navy-800">DANU</Link>
              <span className="text-xs text-teal-600">/ {cfg.title}</span>
            </div>
            <nav className="lg:hidden flex gap-2 overflow-x-auto">
              {cfg.items.map(i => (
                <NavLink key={i.to} to={i.to} end={i.to === cfg.base}
                  className={({ isActive }) => `tab-btn ${isActive ? 'active' : ''}`}>
                  {i.label}
                </NavLink>
              ))}
            </nav>
            <div className="hidden lg:flex items-center gap-2 text-sm text-slate-500">
              <span>{cfg.greeting}, {user?.full_name?.split(' ')[0] ?? user?.email}</span>
            </div>
            <div className="hidden md:flex items-center gap-2">
              <Link to="/" className="btn btn-ghost text-xs">Public site</Link>
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-teal-50 to-navy-50 flex items-center justify-center text-navy-800 font-bold">
                {initials(user?.full_name ?? user?.email ?? '·')}
              </div>
            </div>
          </div>
        </header>
        <main className="px-4 md:px-8 py-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
