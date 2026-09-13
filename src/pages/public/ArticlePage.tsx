import { Link, useParams } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { api, formatDate } from '../../lib/api'
import type { Article } from '../../lib/types'

export default function ArticlePage() {
  const { slug = '' } = useParams<{ slug: string }>()
  const [article, setArticle] = useState<Article | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get<any>('public').then(r => {
      if (r.data) {
        const found = (r.data.articles ?? []).find((a: Article) => a.slug === slug) ?? null
        setArticle(found)
      }
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [slug])

  if (loading) return <div className="max-w-3xl mx-auto px-4 py-20 text-slate-500">Loading…</div>
  if (!article) return (
    <div className="max-w-3xl mx-auto px-4 py-20 text-slate-500">
      Article not found. <Link to="/articles" className="text-teal-600">Back to articles</Link>
    </div>
  )

  return (
    <article className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <p className="text-xs uppercase tracking-wider text-teal-600">{article.author}</p>
      <h1 className="text-3xl md:text-4xl font-display font-extrabold text-navy-800 mt-2">{article.title}</h1>
      <p className="text-xs text-slate-500 mt-2">{formatDate(article.published_at ?? article.created_at)}</p>
      <p className="mt-6 text-slate-700 leading-relaxed whitespace-pre-line">{article.body}</p>
      <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg p-3 mt-8">
        <strong>Disclaimer:</strong> This article is for general information and is not a substitute for professional medical advice.
      </p>
    </article>
  )
}
