// Provider-aware dispatch endpoint for SMS/email. The frontend always calls
// this *after* the in-app notification has been queued so we never claim a
// message was sent without the provider confirming it.
//
// Without provider credentials configured we simply mark the call as
// NOT_CONFIGURED and return 202 — callers should display it as "notification
// recorded" not "notification sent".

import { withAuth } from './_lib/auth'

interface ProviderResponse {
  ok: boolean
  status: 'DELIVERED' | 'NOT_CONFIGURED' | 'FAILED'
  detail?: string
}

async function smtpConfigured(): Promise<boolean> {
  return Boolean(process.env.SMTP_HOST && process.env.SMTP_USERNAME && process.env.SMTP_PASSWORD)
}

async function smsConfigured(): Promise<boolean> {
  return Boolean(process.env.SMS_PROVIDER_API_URL && process.env.SMS_PROVIDER_API_KEY)
}

export default withAuth({ requireUser: true }, async (req, res, _ctx) => {
  if (req.method !== 'POST') {
    res.statusCode = 405
    return res.end(JSON.stringify({ error: 'Method not allowed' }))
  }
  const body = await readBodySafe(req)
  const channel: 'EMAIL' | 'SMS' = body?.channel === 'EMAIL' ? 'EMAIL' : 'SMS'
  const recipient = (body?.recipient as string) ?? ''
  const message = (body?.message as string) ?? ''

  let result: ProviderResponse = { ok: false, status: 'NOT_CONFIGURED', detail: 'Provider not configured in this environment.' }

  try {
    if (channel === 'EMAIL') {
      if (await smtpConfigured()) {
        // In production we'd wire nodemailer here; intentionally not imported
        // because creds are missing on the demo build. We still surface a
        // truthful "DELIVERED" only when the provider returns success.
        result = { ok: false, status: 'NOT_CONFIGURED', detail: 'Email transport not yet wired in this build.' }
      }
    } else {
      if (await smsConfigured()) {
        result = { ok: false, status: 'NOT_CONFIGURED', detail: 'SMS transport not yet wired in this build.' }
      }
    }
  } catch (e) {
    result = { ok: false, status: 'FAILED', detail: (e as Error).message }
  }

  res.statusCode = result.status === 'DELIVERED' ? 200 : 202
  res.end(JSON.stringify(result))
})

function readBodySafe(req: any) {
  return new Promise<any>((resolve, reject) => {
    let raw = ''
    req.on('data', (c: Buffer) => { raw += c })
    req.on('end', () => { try { resolve(JSON.parse(raw || '{}')) } catch (e) { reject(e) } })
    req.on('error', reject)
  })
}
