import { withAuth } from './_lib/auth'

export default withAuth({ requireUser: true, permission: 'audit.read' }, async (req, res, { supabase }) => {
  try {
    if (req.method !== 'GET') {
      res.statusCode = 405
      return res.end(JSON.stringify({ error: 'Method not allowed' }))
    }
    const { data, error } = await supabase
      .from('audit_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(500)
    if (error) throw error
    res.statusCode = 200
    return res.end(JSON.stringify(data))
  } catch (e) {
    res.statusCode = 500
    res.end(JSON.stringify({ error: (e as Error).message }))
  }
})
