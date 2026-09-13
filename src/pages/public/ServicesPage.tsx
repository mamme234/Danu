import { useEffect, useState } from 'react'
import { api } from '../../lib/api'
import type { Service } from '../../lib/types'

export default function ServicesPage() {
  const [services, setServices] = useState<Service[] | null>(null)
  const [filter, setFilter] = useState<string>('All')

  useEffect(() => {
    api.get<any>('public')
      .then(r => { if (r.data) setServices(r.data.services ?? []) })
      .catch(() => setServices([]))
  }, [])

  const categories = Array.from(new Set(['All', ...(services ?? []).map(s => s.category)]))

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <header className="mb-10">
        <p className="text-xs font-bold uppercase tracking-wider text-teal-600">Services</p>
        <h1 className="text-3xl md:text-4xl font-display font-extrabold text-navy-800 mt-1">Specialist orthopaedic services</h1>
        <p className="mt-3 text-slate-600 max-w-3xl">
          Our service catalogue is reviewed by administration and updated as new
          capabilities are verified. Pricing is provided once a service is
          confirmed during scheduling.
        </p>
      </header>

      <div className="flex flex-wrap gap-2 mb-8">
        {categories.map(c => (
          <button
            key={c}
            type="button"
            onClick={() => setFilter(c)}
            className={`chip ${filter === c ? 'active' : ''}`}
          >
            {c}
          </button>
        ))}
      </div>

      {!services && (
        <div className="card p-6">
          <div className="space-y-2">
            {Array.from({ length: 4 }).map((_, i) => (<div key={i} className="h-3 w-2/3 rounded skeleton" />))}
          </div>
        </div>
      )}

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
        {(services ?? [])
          .filter(s => filter === 'All' || s.category === filter)
          .map(s => (
            <article key={s.id} className="card p-6">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-teal-600">{s.category}</span>
              <h2 className="mt-2 text-lg font-semibold text-navy-800">{s.name}</h2>
              <p className="text-sm text-slate-600 mt-2">{s.description}</p>
              <div className="text-xs text-slate-500 mt-3">
                Typical duration: {s.duration_minutes} min • Pricing on confirmation
              </div>
            </article>
          ))}
        {services && services.length === 0 && (
          <div className="card p-6 col-span-full text-sm text-slate-500">
            Service catalogue is being prepared by administration.
          </div>
        )}
      </div>
    </div>
  )
}
