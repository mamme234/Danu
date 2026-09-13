// Pluggable notification providers for email and SMS. These are intentionally
// implemented as no-ops unless real credentials are supplied via the Vercel
// dashboard. The app records every intent in the `notifications` table so we
// always have an audit-grade record, but the message is only delivered when a
// provider client is wired in.

import supabase from './supabaseClient'

export interface NotificationPayload {
  userId: string | null
  kind:
    | 'APPOINTMENT_REQUESTED'
    | 'APPOINTMENT_CONFIRMED'
    | 'APPOINTMENT_RESCHEDULED'
    | 'APPOINTMENT_CANCELLED'
    | 'INVOICE_ISSUED'
    | 'PAYMENT_RECEIVED'
    | 'GENERIC'
  title: string
  message: string
  recipientEmail?: string | null
  recipientPhone?: string | null
}

export async function queueNotification(payload: NotificationPayload): Promise<{ queued: boolean }> {
  const { error } = await supabase.from('notifications').insert({
    user_id: payload.userId,
    kind: payload.kind,
    title: payload.title,
    message: payload.message,
    read: false,
  })
  if (error) {
    // eslint-disable-next-line no-console
    console.warn('[notify] could not queue notification:', error.message)
    return { queued: false }
  }
  return { queued: true }
}

export async function deliverNotification(payload: NotificationPayload): Promise<'DELIVERED' | 'NOT_CONFIGURED' | 'FAILED'> {
  // The real email/SMS provider calls would happen here. Without a configured
  // provider we report NOT_CONFIGURED rather than pretend delivery succeeded.
  const smtpHost = (import.meta.env.VITE_SUPABASE_URL ?? '') // intentionally vague in client
  if (!smtpHost) return 'NOT_CONFIGURED'
  // Real implementations should call out to /api/notifications/dispatch which
  // has access to SMTP/SMS provider credentials. Skipping here so the bundle
  // remains small and so we never display "email sent" when it wasn't.
  return 'NOT_CONFIGURED'
}
