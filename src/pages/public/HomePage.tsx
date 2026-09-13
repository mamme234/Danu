import { Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { api } from '../../lib/api'
import type { Article, Doctor, Facility, Service } from '../../lib/types'
import { initials } from '../../lib/format'
import { SkeletonRow } from '../../components/UI'

interface PublicPayload {
  services: Service[]
  doctors: Doctor[]
  facilities: Facility[]
  articles: Article[]
}

export default function HomePage() {
  const [data, setData] = useState<PublicPayload | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get<PublicPayload>('public')
      .then(r => { if (r.data) setData(r.data) })
      .finally(() => setLoading(false))
  }, [])

  return (
    <div>
      <section className="relative overflow-hidden bg-gradient-to-br from-navy-800 via-navy-700 to-navy-900 text-white">
        <div className="absolute inset-0 opacity-30 hero-grid" aria-hidden />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28 grid lg:grid-cols-12 gap-12 items-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }} className="lg:col-span-7">
            <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 text-teal-300 text-xs font-semibold tracking-wider uppercase border border-white/15">
              <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse" /> DANU Orthopaedic Center • Addis Ababa
            </span>
            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight mt-5">
              Specialist orthopaedic care,<br/>
              <span className="text-teal-400">redefined for Ethiopia.</span>
            </h1>
            <p className="text-white/80 text-base md:text-lg max-w-2xl mt-6 leading-relaxed">
              DANU Orthopaedic Center brings international-standard specialist
              orthopaedic consultation, fracture and trauma care, joint and bone
              condition management, diagnostics and surgical consultation to
              Addis Ababa — with rehabilitation planning and referral built in.
            </p>
            <div className="flex flex-wrap gap-3 mt-8">
              <Link to="/appointment" className="btn btn-primary">Book Appointment</Link>
              <Link to="/contact" className="btn btn-ghost text-navy-800">Contact DANU</Link>
            </div>
            <dl className="grid grid-cols-3 gap-6 mt-12 max-w-xl">
              <div><dt className="text-teal-300 font-display font-extrabold text-2xl">07</dt><dd className="text-white/70 text-xs uppercase tracking-wider mt-1">Service areas</dd></div>
              <div><dt className="text-teal-300 font-display font-extrabold text-2xl">06</dt><dd className="text-white/70 text-xs uppercase tracking-wider mt-1">Patient journey steps</dd></div>
              <div><dt className="text-teal-300 font-display font-extrabold text-2xl">24/7</dt><dd className="text-white/70 text-xs uppercase tracking-wider mt-1">Emergencies via local services</dd></div>
            </dl>
          </motion.div>
          <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8, delay: 0.2 }} className="lg:col-span-5">
            <div className="card bg-white/10 backdrop-blur border border-white/15 p-6 text-white">
              <h3 className="text-lg font-display font-semibold text-teal-300">Why DANU</h3>
              <ul className="mt-4 space-y-3 text-sm">
                {[
                  'Specialist orthopaedic care with clear care plans.',
                  'Conflict-safe scheduling and patient-first booking.',
                  'Secure records with role-based access for staff.',
                  'Rehabilitation and surgical referrals integrated.',
                  'Designed for Ethiopian families in Addis Ababa.',
                ].map(item => (
                  <li key={item} className="flex gap-3 items-start">
                    <span className="mt-1 w-2 h-2 rounded-full bg-teal-400" />
                    <span className="text-white/85">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20">
        <div className="flex justify-between items-end mb-8">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-teal-600">Services</p>
            <h2 className="text-3xl md:text-4xl font-display font-extrabold text-navy-800 mt-1">Care areas at DANU</h2>
          </div>
          <Link to="/services" className="hidden sm:inline text-teal-600 hover:text-teal-700 text-sm font-semibold">All services →</Link>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {loading && Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="card p-6">
              <div className="h-3 w-20 skeleton rounded mb-3" />
              <div className="h-5 w-3/4 skeleton rounded mb-3" />
              <div className="h-12 skeleton rounded" />
            </div>
          ))}
          {(data?.services ?? []).map(s => (
            <article key={s.id} className="card p-6">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-teal-600">{s.category}</span>
              <h3 className="mt-2 text-lg font-semibold text-navy-800">{s.name}</h3>
              <p className="mt-2 text-sm text-slate-600 line-clamp-3">{s.description}</p>
              <Link to="/services" className="mt-3 text-teal-600 hover:text-teal-700 text-sm font-semibold">Learn more →</Link>
            </article>
          ))}
          {!loading && (data?.services ?? []).length === 0 && (
            <div className="card p-6 col-span-full text-sm text-slate-500">
              Service catalogue is being prepared by administration. Please contact reception for the current list of services.
            </div>
          )}
        </div>
      </section>

      <section className="bg-slate-50 py-16 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-teal-600">Why choose DANU</p>
            <h2 className="text-3xl md:text-4xl font-display font-extrabold text-navy-800 mt-1">Built around the patient, designed for clinicians.</h2>
            <p className="text-slate-600 mt-4 leading-relaxed">
              Our centre is structured around the way orthopaedic care actually flows:
              from first consultation, to imaging or surgical planning, through to
              rehabilitation and follow-up. We keep your information secure, our
              scheduling fair, and our communication clear.
            </p>
            <div className="mt-6 grid sm:grid-cols-2 gap-4">
              {[
                ['Specialist team', 'A multidisciplinary orthopaedic team with verified credentials.'],
                ['Patient-first booking', 'Conflict-safe online scheduling with human confirmation.'],
                ['Secure records', 'Role-based access for clinical and administrative staff.'],
                ['Rehabilitation', 'On-site rehabilitation pathways with referral partners.'],
              ].map(([t, d]) => (
                <div key={t} className="card p-4">
                  <h4 className="font-semibold text-navy-800">{t}</h4>
                  <p className="text-sm text-slate-600 mt-1">{d}</p>
                </div>
              ))}
            </div>
          </div>
          <div>
            <div className="card p-6">
              <h3 className="text-lg font-display font-semibold text-navy-800">Your patient journey</h3>
              <ol className="mt-4 space-y-4 text-sm">
                {[
                  'Request an appointment online or by phone.',
                  'Receive confirmation from reception with date and time.',
                  'On arrival you are welcomed and prepared by our nursing team.',
                  'Consultation includes examination and care plan review.',
                  'Diagnostics or surgical consultation are coordinated as needed.',
                  'Rehabilitation and follow-up are scheduled at discharge.',
                ].map((step, i) => (
                  <li key={i} className="path-step">
                    <span className="path-num">{String(i + 1).padStart(2, '0')}</span>
                    <p className="font-medium text-navy-800">{step}</p>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20">
        <div className="flex justify-between items-end mb-8">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-teal-600">Medical team</p>
            <h2 className="text-3xl md:text-4xl font-display font-extrabold text-navy-800 mt-1">Our orthopaedic specialists</h2>
          </div>
          <Link to="/doctors" className="hidden sm:inline text-teal-600 hover:text-teal-700 text-sm font-semibold">View doctors →</Link>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {loading && Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="card p-5">
              <div className="w-20 h-20 skeleton rounded-full mb-3" />
              <div className="h-4 w-32 skeleton rounded" />
              <div className="h-3 w-20 skeleton rounded mt-2" />
            </div>
          ))}
          {(data?.doctors ?? []).slice(0, 3).map(doc => (
            <article key={doc.id} className="card p-5">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-teal-50 to-navy-50 flex items-center justify-center text-2xl font-extrabold text-navy-800">
                {initials(doc.name)}
              </div>
              <h3 className="mt-4 text-lg font-semibold text-navy-800">{doc.name}</h3>
              <p className="text-sm text-teal-600">{doc.specialty}</p>
              <p className="text-xs text-slate-500 mt-1">{doc.languages || 'Amharic, English'}</p>
              <span className="badge mt-3 bg-amber-50 text-amber-700 border border-amber-200">Verified at visit</span>
            </article>
          ))}
          {!loading && (data?.doctors ?? []).length === 0 && (
            <div className="card p-5 col-span-full text-sm text-slate-500">
              Doctor profiles are being verified by administration.
            </div>
          )}
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="card p-8 md:p-12 bg-gradient-to-br from-navy-800 to-navy-700 text-white flex flex-col md:flex-row items-center gap-8">
          <div className="flex-1">
            <h2 className="text-2xl md:text-3xl font-display font-extrabold">Ready to book your consultation?</h2>
            <p className="text-white/80 mt-2">Request an appointment and our team will confirm your slot within working hours.</p>
          </div>
          <Link to="/appointment" className="btn btn-primary">Book Appointment</Link>
        </div>
      </section>
    </div>
  )
}
