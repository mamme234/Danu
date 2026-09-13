import { Outlet, Link, NavLink, useLocation } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { useApp } from '../context/AppState'

const navItems = [
  { to: '/', label: 'Home' },
  { to: '/about', label: 'About' },
  { to: '/services', label: 'Services' },
  { to: '/doctors', label: 'Doctors' },
  { to: '/facilities', label: 'Facilities' },
  { to: '/patient-information', label: 'Patient Info' },
  { to: '/appointment', label: 'Appointment' },
  { to: '/faq', label: 'FAQ' },
  { to: '/articles', label: 'Articles' },
  { to: '/contact', label: 'Contact' },
]

export function PublicLayout() {
  const { demoMode, user, role, signOut, notifications } = useApp()
  const [menuOpen, setMenuOpen] = useState(false)
  const loc = useLocation()

  useEffect(() => { setMenuOpen(false) }, [loc.pathname])

  return (
    <div className="min-h-screen flex flex-col">
      {demoMode && (
        <div className="bg-amber-50 border-b border-amber-200 text-amber-900 text-[12px] px-4 py-1.5 text-center font-medium">
          <strong>Demo mode.</strong> Records and doctor profiles shown here are
          development placeholders and have not been verified by DANU administration.
        </div>
      )}
      <header className="sticky top-0 z-50 bg-white/85 backdrop-blur-xl border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16 lg:h-[70px]">
          <Link to="/" className="flex items-center gap-2.5 group">
            <svg width="40" height="40" viewBox="0 0 64 64" className="transition-transform group-hover:scale-105">
              <rect width="64" height="64" rx="14" fill="#0a2540"/>
              <path d="M32 15a6 6 0 016 6v5h5a6 6 0 010 12h-5v5a6 6 0 01-12 0v-5h-5a6 6 0 010-12h5v-5a6 6 0 016-6z" fill="#14b8a6"/>
            </svg>
            <div className="leading-none">
              <div className="font-display font-extrabold text-navy-800 text-lg tracking-tight">DANU</div>
              <div className="text-teal-600 text-[9px] tracking-[.22em] font-bold uppercase mt-0.5">Orthopaedic Center</div>
            </div>
          </Link>
          <nav className="hidden lg:flex items-center gap-7">
            {navItems.map(item => (
              <NavLink key={item.to} to={item.to} end={item.to === '/'} className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                {item.label}
              </NavLink>
            ))}
          </nav>
          <div className="flex items-center gap-2">
            {user ? (
              <>
                <Link to={`/${role === 'PATIENT' ? 'patient' : 'admin'}`} className="btn btn-ghost text-sm hidden md:inline-flex">
                  {role === 'PATIENT' ? 'My dashboard' : 'Admin'}
                  {role !== 'PATIENT' && notifications.length > 0 && (
                    <span className="ml-2 inline-flex items-center justify-center w-5 h-5 text-[10px] rounded-full bg-teal-500 text-white">{notifications.length}</span>
                  )}
                </Link>
                <button onClick={signOut} className="btn btn-ghost text-sm">Sign out</button>
              </>
            ) : (
              <>
                <Link to="/login" className="btn btn-ghost text-sm hidden md:inline-flex">Sign in</Link>
                <Link to="/appointment" className="btn btn-primary text-sm">Book Appointment</Link>
              </>
            )}
            <button onClick={() => setMenuOpen(o => !o)} aria-label="Toggle menu" className="lg:hidden p-2 rounded-lg hover:bg-slate-100">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 7h16M4 12h16M4 17h16" strokeLinecap="round" /></svg>
            </button>
          </div>
        </div>
        {menuOpen && (
          <div className="lg:hidden border-t border-slate-100 px-4 py-3 space-y-2">
            {navItems.map(item => (
              <NavLink key={item.to} to={item.to} end={item.to === '/'} className={({ isActive }) => `block px-3 py-2 rounded-lg text-sm font-medium ${isActive ? 'bg-teal-50 text-teal-700' : 'text-slate-700 hover:bg-slate-50'}`}>
                {item.label}
              </NavLink>
            ))}
            <div className="flex gap-2 pt-2">
              <Link to="/login" className="btn btn-ghost flex-1">Sign in</Link>
              <Link to="/appointment" className="btn btn-primary flex-1">Book</Link>
            </div>
          </div>
        )}
      </header>
      <main className="flex-1">
        <Outlet />
      </main>
      <footer className="bg-navy-800 text-white py-14 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid gap-10 md:grid-cols-4">
          <div>
            <div className="flex items-center gap-2.5">
              <svg width="36" height="36" viewBox="0 0 64 64"><rect width="64" height="64" rx="14" fill="#fff"/><path d="M32 15a6 6 0 016 6v5h5a6 6 0 010 12h-5v5a6 6 0 01-12 0v-5h-5a6 6 0 010-12h5v-5a6 6 0 016-6z" fill="#14b8a6"/></svg>
              <div>
                <div className="font-display font-extrabold text-lg tracking-tight">DANU</div>
                <div className="text-teal-300 text-[9px] tracking-[.22em] font-bold uppercase">Orthopaedic Center</div>
              </div>
            </div>
            <p className="text-white/70 mt-4 text-sm leading-relaxed">
              Specialist orthopaedic consultation, fracture and trauma care, joint and bone condition management, diagnostics, surgical consultation and rehabilitation referral in Addis Ababa.
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-3">Explore</h4>
            <ul className="space-y-2 text-sm text-white/70">
              {navItems.slice(0, 6).map(item => (
                <li key={item.to}><Link to={item.to} className="hover:text-teal-300">{item.label}</Link></li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-3">Resources</h4>
            <ul className="space-y-2 text-sm text-white/70">
              <li><Link to="/faq" className="hover:text-teal-300">FAQ</Link></li>
              <li><Link to="/articles" className="hover:text-teal-300">Articles</Link></li>
              <li><Link to="/patient-information" className="hover:text-teal-300">Patient information</Link></li>
              <li><Link to="/privacy" className="hover:text-teal-300">Privacy Policy</Link></li>
              <li><Link to="/terms" className="hover:text-teal-300">Terms of Use</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-3">Contact</h4>
            <p className="text-sm text-white/70">
              DANU Orthopaedic Center<br />
              Address, phone and email to be confirmed by administration.<br />
              Hours: to be confirmed by administration.
            </p>
            <p className="text-xs text-amber-200 mt-3">
              For medical emergencies please contact local emergency services (e.g. 907/911) or visit the nearest emergency department.
            </p>
          </div>
        </div>
        <div className="text-center text-white/50 text-xs mt-10">© {new Date().getFullYear()} DANU Orthopaedic Center. All rights reserved.</div>
      </footer>
    </div>
  )
}
