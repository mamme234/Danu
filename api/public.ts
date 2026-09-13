// Aggregated public read endpoint. Returns published content only.
import { withAuth } from './_lib/auth'

export default withAuth({}, async (_req, res, { supabase }) => {
  const [{ data: services }, { data: doctors }, { data: facilities }, { data: faq }, { data: articles }, { data: blocks }] = await Promise.all([
    supabase.from('services').select('*').eq('status', 'PUBLISHED').order('name'),
    supabase.from('doctors').select('*').eq('status', 'PUBLISHED').order('name'),
    supabase.from('facilities').select('*').eq('status', 'PUBLISHED').order('order'),
    supabase.from('faq_items').select('*').eq('status', 'PUBLISHED').order('order'),
    supabase.from('articles').select('*').eq('status', 'PUBLISHED').order('published_at', { ascending: false }),
    supabase.from('content_blocks').select('*').eq('status', 'PUBLISHED'),
  ])
  res.setHeader('Content-Type', 'application/json')
  res.statusCode = 200
  res.end(JSON.stringify({ services, doctors, facilities, faq, articles, blocks }))
})
