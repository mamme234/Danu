// Admin-only listing of users (used by /pages/portal/StaffUsers).
import { withAuth, audit } from './_lib/auth.js'

export default withAuth({ requireUser: true, permission: 'staff.write' }, async (req, res, { supabase }) => {
  try {
    if (req.method !== 'GET') {
      res.statusCode = 405
      return res.end(JSON.stringify({ error: 'Method not allowed' }))
    }
    const { data, error } = await supabase
      .from('user_profiles')
      .select('id, email, full_name, role, active, created_at')
      .order('created_at', { ascending: false })
      .limit(500)
    if (error) throw error
    res.statusCode = 200
    return res.end(JSON.stringify(data))
  } catch (e) {
    res.statusCode = 500
    return res.end(JSON.stringify({ error: (e as Error).message }))
  }
})
