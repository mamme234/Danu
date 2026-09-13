import { lazy, Suspense } from 'react'
import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { AppProvider, useApp } from './context/AppState'
import { Spinner } from './components/UI'
import { PublicLayout } from './components/Layout'
import { PortalLayout } from './components/Portal'
import type { AppRole } from './lib/types'

import HomePage from './pages/public/HomePage'
import AboutPage from './pages/public/AboutPage'
import ServicesPage from './pages/public/ServicesPage'
import DoctorsPage from './pages/public/DoctorsPage'
import FacilitiesPage from './pages/public/FacilitiesPage'
import PatientInfoPage from './pages/public/PatientInfoPage'
import AppointmentPage from './pages/public/AppointmentPage'
import FaqPage from './pages/public/FaqPage'
import ArticlesPage from './pages/public/ArticlesPage'
import ArticlePage from './pages/public/ArticlePage'
import ContactPage from './pages/public/ContactPage'
import { PrivacyPolicyPage, TermsPage } from './pages/public/LegalPages'

import LoginPage from './pages/auth/LoginPage'

import PatientDashboard from './pages/portal/PatientDashboard'
import PatientAppointments from './pages/portal/PatientAppointments'
import PatientInvoicesPage from './pages/portal/PatientInvoices'
import PatientNotifications from './pages/portal/PatientNotifications'
import PatientProfile from './pages/portal/PatientProfile'
import ReceptionDashboard from './pages/portal/ReceptionDashboard'
import ReceptionPatients from './pages/portal/ReceptionPatients'
import DoctorDashboard from './pages/portal/DoctorDashboard'
import NurseDashboard from './pages/portal/NurseDashboard'
import BillingDashboard from './pages/portal/BillingDashboard'
import AdminDashboard from './pages/portal/AdminDashboard'
import StaffUsersPage from './pages/portal/StaffUsersPage'
import AuditLogPage from './pages/portal/AuditLogPage'
import SettingsPage from './pages/portal/SettingsPage'
import { ServicesCms, DoctorsCms, FacilitiesCms, FaqCms, ArticlesCms, BlocksCms } from './pages/portal/CmsEditor'

function Protected({ children, allow }: { children: React.ReactNode; allow: AppRole[] }) {
  const { user, role, loading } = useApp()
  const loc = useLocation()
  if (loading) return <div className="p-10 flex justify-center"><Spinner /></div>
  if (!user) return <Navigate to="/login" replace state={{ from: loc.pathname }} />
  if (role && !allow.includes(role)) return <Navigate to="/" replace />
  return <>{children}</>
}

function PortalRoutes({ base, role, dashboard, extras }: { base: string; role: AppRole; dashboard: React.ReactNode; extras?: React.ReactNode }) {
  return (
    <Routes>
      <Route element={<PortalLayout role={role} />}>
        <Route index element={dashboard} />
        {extras}
        <Route path="*" element={<Navigate to={base} replace />} />
      </Route>
    </Routes>
  )
}

function DemoBanner() {
  const { demoMode } = useApp()
  if (!demoMode) return null
  return (
    <div className="bg-amber-50 border-b border-amber-200 text-amber-900 text-xs px-4 py-1.5 text-center font-medium">
      <strong>Demo mode.</strong> Records shown are development placeholders. Verify before production.
    </div>
  )
}

function App() {
  return (
    <AppProvider>
      <DemoBanner />
      <Suspense fallback={<div className="p-10"><Spinner /></div>}>
        <Routes>
          {/* Public site */}
          <Route element={<PublicLayout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/services" element={<ServicesPage />} />
            <Route path="/doctors" element={<DoctorsPage />} />
            <Route path="/facilities" element={<FacilitiesPage />} />
            <Route path="/patient-information" element={<PatientInfoPage />} />
            <Route path="/appointment" element={<AppointmentPage />} />
            <Route path="/faq" element={<FaqPage />} />
            <Route path="/articles" element={<ArticlesPage />} />
            <Route path="/articles/:slug" element={<ArticlePage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/privacy" element={<PrivacyPolicyPage />} />
            <Route path="/terms" element={<TermsPage />} />
          </Route>

          <Route path="/login" element={<LoginPage />} />

          {/* Patient portal */}
          <Route path="/patient" element={<Protected allow={['PATIENT', 'ADMIN', 'SUPER_ADMIN']}><PortalRoutes base="/patient" role="PATIENT" dashboard={<PatientDashboard />}
            extras={<>
              <Route path="appointments" element={<PatientAppointments />} />
              <Route path="invoices" element={<PatientInvoicesPage />} />
              <Route path="notifications" element={<PatientNotifications />} />
              <Route path="profile" element={<PatientProfile />} />
            </>}
          /></Protected>} />

          {/* Reception */}
          <Route path="/reception" element={<Protected allow={['RECEPTIONIST', 'ADMIN', 'SUPER_ADMIN']}><PortalRoutes base="/reception" role="RECEPTIONIST" dashboard={<ReceptionDashboard />}
            extras={<>
              <Route path="appointments" element={<ReceptionDashboard />} />
              <Route path="queue" element={<ReceptionDashboard />} />
              <Route path="patients" element={<ReceptionPatients />} />
            </>}
          /></Protected>} />

          {/* Doctor */}
          <Route path="/doctor" element={<Protected allow={['DOCTOR', 'ADMIN', 'SUPER_ADMIN']}><PortalRoutes base="/doctor" role="DOCTOR" dashboard={<DoctorDashboard />}
            extras={<>
              <Route path="schedule" element={<DoctorDashboard />} />
              <Route path="queue" element={<DoctorDashboard />} />
              <Route path="visits" element={<DoctorDashboard />} />
            </>}
          /></Protected>} />

          {/* Nurse */}
          <Route path="/nurse" element={<Protected allow={['NURSE', 'ADMIN', 'SUPER_ADMIN']}><PortalRoutes base="/nurse" role="NURSE" dashboard={<NurseDashboard />}
            extras={<>
              <Route path="queue" element={<NurseDashboard />} />
              <Route path="preparation" element={<NurseDashboard />} />
            </>}
          /></Protected>} />

          {/* Billing */}
          <Route path="/billing" element={<Protected allow={['ACCOUNTANT', 'ADMIN', 'SUPER_ADMIN']}><PortalRoutes base="/billing" role="ACCOUNTANT" dashboard={<BillingDashboard />}
            extras={<>
              <Route path="invoices" element={<BillingDashboard />} />
              <Route path="reports" element={<BillingDashboard />} />
            </>}
          /></Protected>} />

          {/* CMS */}
          <Route path="/cms" element={<Protected allow={['CONTENT_MANAGER', 'ADMIN', 'SUPER_ADMIN']}><PortalRoutes base="/cms" role="CONTENT_MANAGER" dashboard={<ServicesCms />}
            extras={<>
              <Route path="services" element={<ServicesCms />} />
              <Route path="doctors" element={<DoctorsCms />} />
              <Route path="facilities" element={<FacilitiesCms />} />
              <Route path="faq" element={<FaqCms />} />
              <Route path="articles" element={<ArticlesCms />} />
              <Route path="blocks" element={<BlocksCms />} />
            </>}
          /></Protected>} />

          {/* Admin */}
          <Route path="/admin" element={<Protected allow={['ADMIN', 'SUPER_ADMIN']}><PortalRoutes base="/admin" role="ADMIN" dashboard={<AdminDashboard />}
            extras={<>
              <Route path="users" element={<StaffUsersPage />} />
              <Route path="audit" element={<AuditLogPage />} />
              <Route path="settings" element={<SettingsPage />} />
            </>}
          /></Protected>} />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </AppProvider>
  )
}

export default App
