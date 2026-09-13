import { withAuth, audit } from './_lib/auth'

export default withAuth({ requireUser: true }, async (req, res, { supabase, user }) => {
  try {
    if (req.method === 'GET') {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(100)
      if (error) throw error
      res.statusCode = 200
      return res.end(JSON.stringify(data))
    }
    if (req.method === 'PUT') {
      const body = await readBodySafe(req)
      const { data, error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', body.id)
        .eq('user_id', user.id)
        .select()
        .single()
      if (error) throw error
      res.statusCode = 200
      return res.end(JSON.stringify(data))
    }
    res.statusCode = 405
    res.end(JSON.stringify({ error: 'Method not allowed' }))
  } catch (e) {
    res.statusCode = 500
    res.end(JSON.stringify({ error: (e as Error).message }))
  }
})

function readBodySafe(req: any) {
  return new Promise<any>((resolve, reject) => {
    let raw = ''
    req.on('data', (c: Buffer) => { raw += c })
    req.on('end', () => { try { resolve(JSON.parse(raw || '{}')) } catch (e) { reject(e) } })
    req.on('error', reject)
  })
}
