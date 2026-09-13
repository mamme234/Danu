import { useEffect, useState } from 'react'
import { api } from '../../lib/api'
import type { Doctor } from '../../lib/types'
import { initials } from '../../lib/format'

export default function DoctorsPage() {
  const [doctors, setDoctors] = useState<Doctor[] | null>(null)

  useEffect(() => {
    api.get<any>('public')
      .then(r => { if (r.data) setDoctors(r.data.doctors ?? []) })
      .catch(() => setDoctors([]))
  }, [])

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <header className="mb-10">
        <p className="text-xs font-bold uppercase tracking-wider text-teal-600">Doctors</p>
        <h1 className="text-3xl md:text-4xl font-display font-extrabold text-navy-800 mt-1">Our medical team</h1>
        <p className="mt-3 text-slate-600 max-w-3xl">
          Doctor profiles are published only after credentials, qualifications and
          biography have been verified by administration. Until verified,
          profiles remain in draft.
        </p>
      </header>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {(doctors ?? []).map(doc => (
          <article key={doc.id} className="card p-6">
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-teal-50 to-navy-50 flex items-center justify-center text-lg font-extrabold text-navy-800">
                {initials(doc.name)}
              </div>
              <div>
                <h2 className="font-semibold text-navy-800">{doc.name}</h2>
                <p className="text-sm text-teal-600">{doc.specialty}</p>
              </div>
            </div>
            <p className="text-sm text-slate-600 mt-4 line-clamp-4">{doc.biography}</p>
            <div className="text-xs text-slate-500 mt-3 space-y-1">
              <div>Languages: {doc.languages || 'Amharic, English'}</div>
              <div>Experience: {doc.experience}</div>
            </div>
          </article>
        ))}
        {doctors && doctors.length === 0 && (
          <div className="card p-6 col-span-full text-sm text-slate-500">
            Doctor profiles are being verified by administration.
          </div>
        )}
      </div>
    </div>
  )
}
