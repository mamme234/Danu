import { useEffect, useState } from 'react'
import { api } from '../../lib/api'
import type { ContentBlock } from '../../lib/types'

export default function ContactPage() {
  const [block, setBlock] = useState<ContentBlock | null>(null)

  useEffect(() => {
    api.get<any>(`content?resource=content_blocks&block=contact.info`)
      .then(r => { if (r.data) setBlock((Array.isArray(r.data) ? r.data[0] : null) ?? null) })
      .catch(() => null)
  }, [])

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 grid md:grid-cols-2 gap-8">
      <div>
        <p className="text-xs font-bold uppercase tracking-wider text-teal-600">Contact</p>
        <h1 className="text-3xl md:text-4xl font-display font-extrabold text-navy-800 mt-1">Get in touch with DANU</h1>
        <p className="mt-3 text-slate-600 leading-relaxed">
          Contact details are maintained by administration. For medical
          emergencies please use local emergency services (e.g. 907/911) or
          visit the nearest emergency department.
        </p>
        <pre className="mt-4 bg-slate-50 border border-slate-200 rounded-2xl p-5 text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">
{block?.body ?? 'Address, phone, email and opening hours to be confirmed by administration.'}
        </pre>
      </div>
      <div className="card p-6">
        <h2 className="font-semibold text-navy-800">Send us a message</h2>
        <p className="text-sm text-slate-500 mt-1">For non-urgent enquiries only. Do not include clinical details.</p>
        <form onSubmit={e => { e.preventDefault(); alert('Thanks — reception will follow up.') }} className="mt-4 space-y-3">
          <input className="field" placeholder="Full name" required />
          <input className="field" type="email" placeholder="Email" required />
          <input className="field" placeholder="Subject" required />
          <textarea className="field min-h-[100px]" placeholder="Message" required />
          <button className="btn btn-primary w-full">Send message</button>
        </form>
      </div>
    </div>
  )
}
