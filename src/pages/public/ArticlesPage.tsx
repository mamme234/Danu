import { Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { api, formatDate } from '../../lib/api'
import type { Article } from '../../lib/types'

export default function ArticlesPage() {
  const [articles, setArticles] = useState<Article[] | null>(null)

  useEffect(() => {
    api.get<any>('public').then(r => { if (r.data) setArticles(r.data.articles ?? []) }).catch(() => setArticles([]))
  }, [])

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <header className="mb-10">
        <p className="text-xs font-bold uppercase tracking-wider text-teal-600">Articles &amp; news</p>
        <h1 className="text-3xl md:text-4xl font-display font-extrabold text-navy-800 mt-1">Orthopaedic information and updates</h1>
        <p className="mt-3 text-slate-600 max-w-3xl">
          Editorial pieces and announcements verified by administration. They
          are not a substitute for medical advice.
        </p>
      </header>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {(articles ?? []).map(a => (
          <article key={a.id} className="card p-6">
            <p className="text-[11px] uppercase tracking-wider text-teal-600">{a.author}</p>
            <h2 className="font-semibold text-navy-800 text-lg mt-2">{a.title}</h2>
            <p className="text-sm text-slate-600 mt-2 line-clamp-3">{a.summary}</p>
            <p className="text-xs text-slate-500 mt-3">{formatDate(a.published_at ?? a.created_at)}</p>
            <Link to={`/articles/${a.slug}`} className="text-teal-600 hover:text-teal-700 text-sm font-semibold mt-3 inline-block">Read more →</Link>
          </article>
        ))}
        {articles && articles.length === 0 && (
          <div className="card p-6 col-span-full text-sm text-slate-500">
            Articles will appear here as they are published.
          </div>
        )}
      </div>
    </div>
  )
}
