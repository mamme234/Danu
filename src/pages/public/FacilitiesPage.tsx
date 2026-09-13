import { useEffect, useState } from 'react'
import { api } from '../../lib/api'
import type { Facility } from '../../lib/types'

export default function FacilitiesPage() {
  const [facilities, setFacilities] = useState<Facility[] | null>(null)

  useEffect(() => {
    api.get<any>('public')
      .then(r => { if (r.data) setFacilities(r.data.facilities ?? []) })
      .catch(() => setFacilities([]))
  }, [])

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <header className="mb-10">
        <p className="text-xs font-bold uppercase tracking-wider text-teal-600">Facilities</p>
        <h1 className="text-3xl md:text-4xl font-display font-extrabold text-navy-800 mt-1">A clinic designed for orthopaedic care.</h1>
        <p className="mt-3 text-slate-600 max-w-3xl">
          From reception to rehabilitation, our facilities are designed for safe,
          dignified specialist care.
        </p>
      </header>

      <div className="grid md:grid-cols-2 gap-5">
        {(facilities ?? []).map(f => (
          <article key={f.id} className="card p-6">
            <h2 className="font-semibold text-navy-800 text-lg">{f.name}</h2>
            <p className="text-sm text-slate-600 mt-2">{f.description}</p>
          </article>
        ))}
        {facilities && facilities.length === 0 && (
          <div className="card p-6 col-span-full text-sm text-slate-500">
            Facility descriptions are being verified by administration.
          </div>
        )}
      </div>
    </div>
  )
}
