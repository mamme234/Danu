import { useEffect, useState } from 'react'
import { api } from '../../lib/api'
import type { FaqItem } from '../../lib/types'

export default function FaqPage() {
  const [items, setItems] = useState<FaqItem[] | null>(null)

  useEffect(() => {
    api.get<any>('public').then(r => { if (r.data) setItems(r.data.faq ?? []) }).catch(() => setItems([]))
  }, [])

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <header className="mb-10">
        <p className="text-xs font-bold uppercase tracking-wider text-teal-600">FAQ</p>
        <h1 className="text-3xl md:text-4xl font-display font-extrabold text-navy-800 mt-1">Frequently asked questions</h1>
        <p className="mt-3 text-slate-600">
          Answers evolve as our policies are confirmed. If you cannot find what
          you need, please contact reception.
        </p>
      </header>

      <div className="card divide-y divide-slate-100">
        {(items ?? []).map(item => (
          <details key={item.id} className="acc-item">
            <summary className="acc-q">
              <span>{item.question}</span>
              <span className="acc-icon text-xl">＋</span>
            </summary>
            <div className="acc-a">{item.answer}</div>
          </details>
        ))}
        {items && items.length === 0 && (
          <div className="p-6 text-sm text-slate-500">
            FAQ items will be published as administration finalises them.
          </div>
        )}
      </div>
    </div>
  )
}
