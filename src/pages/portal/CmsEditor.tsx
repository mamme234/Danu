import { useEffect, useState } from 'react'
import { api } from '../../lib/api'
import type { Service, Doctor, Facility, FaqItem, Article, ContentBlock } from '../../lib/types'
import { PageHeader, Badge } from '../../components/UI'

interface ResourcePageProps<T> {
  title: string
  endpoint: 'services' | 'doctors' | 'facilities' | 'faq_items' | 'articles' | 'content_blocks'
  columns: Array<{ key: string; label: string; render?: (row: T) => any }>
  draftInitial?: Partial<T>
}

export default function CmsEditor<T extends { id?: string; status?: string; name?: string; title?: string }>(
  props: ResourcePageProps<T>
) {
  const [items, setItems] = useState<T[] | null>(null)
  const [draft, setDraft] = useState<Partial<T>>(props.draftInitial ?? {})
  const [editing, setEditing] = useState<T | null>(null)

  async function refresh() {
    const r = await api.get<T[]>(`content?resource=${props.endpoint}`)
    if (r.data) setItems(r.data)
  }
  useEffect(() => { refresh() }, [])

  async function save() {
    const row = { ...draft }
    if (editing) Object.assign(row, editing)
    const r = await fetch(`/api/content`, {
      method: editing ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ resource: props.endpoint, row }),
    })
    if (r.ok) { setDraft({}); setEditing(null); refresh() }
    else alert('Save failed.')
  }

  async function publish(row: T) {
    const r = await fetch(`/api/content`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ resource: props.endpoint, row: { ...row, status: 'PUBLISHED' } }),
    })
    if (r.ok) refresh()
  }

  return (
    <div className="space-y-6">
      <PageHeader title={props.title} />

      <section className="card p-5">
        <h3 className="font-semibold text-navy-800">{editing ? 'Edit entry' : 'New entry'}</h3>
        <div className="grid md:grid-cols-2 gap-3 mt-4">
          <textarea className="field md:col-span-2" placeholder="Content (JSON or text)" rows={4} value={typeof draft === 'object' && draft && 'body' in (draft as any) ? (draft as any).body ?? '' : ''} onChange={e => setDraft({ ...draft, body: e.target.value } as any)} />
          <input className="field" placeholder="Title / name" value={typeof (draft as any)?.title === 'string' ? (draft as any).title : (draft as any)?.name ?? ''} onChange={e => setDraft({ ...draft, title: e.target.value } as any)} />
          <select className="field" value={(draft as any)?.status ?? 'DRAFT'} onChange={e => setDraft({ ...draft, status: e.target.value } as any)}>
            <option value="DRAFT">DRAFT</option>
            <option value="PUBLISHED">PUBLISHED</option>
            <option value="ARCHIVED">ARCHIVED</option>
          </select>
        </div>
        <div className="flex justify-end gap-2 mt-4">
          {editing && <button onClick={() => { setEditing(null); setDraft({}) }} className="btn btn-ghost">Cancel edit</button>}
          <button onClick={save} className="btn btn-primary">{editing ? 'Update' : 'Create draft'}</button>
        </div>
        <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg p-3 mt-3">
          The CMS write endpoint expects JSON for arbitrary columns. The default editor captures the most common fields (title, body, status). Inline editors per resource can be added without code changes by extending this pattern.
        </p>
      </section>

      <section className="card p-5">
        <div className="overflow-x-auto">
          <table className="table-wrap">
            <thead><tr>{props.columns.map(c => (<th key={c.key}>{c.label}</th>))}<th>Status</th><th></th></tr></thead>
            <tbody>
              {(items ?? []).map(row => (
                <tr key={row.id}>
                  {props.columns.map(c => (<td key={c.key}>{c.render ? c.render(row) : (row as any)[c.key]}</td>))}
                  <td><Badge status={row.status ?? 'DRAFT'} /></td>
                  <td className="text-right space-x-1">
                    <button onClick={() => setEditing(row)} className="btn btn-ghost text-xs">Edit</button>
                    {row.status !== 'PUBLISHED' && <button onClick={() => publish(row)} className="btn btn-primary text-xs">Publish</button>}
                  </td>
                </tr>
              ))}
              {!items && <tr><td colSpan={props.columns.length + 2} className="text-sm text-slate-500">Loading…</td></tr>}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}

export function ServicesCms() { return <CmsEditor<Service> title="Services" endpoint="services" columns={[{ key: 'name', label: 'Name' }, { key: 'category', label: 'Category' }]} /> }
export function DoctorsCms() { return <CmsEditor<Doctor> title="Doctors" endpoint="doctors" columns={[{ key: 'name', label: 'Name' }, { key: 'specialty', label: 'Specialty' }]} /> }
export function FacilitiesCms() { return <CmsEditor<Facility> title="Facilities" endpoint="facilities" columns={[{ key: 'name', label: 'Name' }, { key: 'description', label: 'Description' }]} /> }
export function FaqCms() { return <CmsEditor<FaqItem> title="FAQ" endpoint="faq_items" columns={[{ key: 'question', label: 'Question' }, { key: 'category', label: 'Category' }]} /> }
export function ArticlesCms() { return <CmsEditor<Article> title="Articles" endpoint="articles" columns={[{ key: 'title', label: 'Title' }, { key: 'slug', label: 'Slug' }, { key: 'author', label: 'Author' }]} /> }
export function BlocksCms() { return <CmsEditor<ContentBlock> title="Content blocks" endpoint="content_blocks" columns={[{ key: 'key', label: 'Key' }, { key: 'title', label: 'Title' }]} /> }
