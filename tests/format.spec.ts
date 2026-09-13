import { describe, expect, it } from 'vitest'
import { formatETB, formatDate, todayISO } from '../src/lib/api'
import { appointmentStatusColor, invoiceStatusColor, initials } from '../src/lib/format'

describe('formatting', () => {
  it('formats currency as ETB', () => {
    const out = formatETB(1234.5)
    expect(out).toMatch(/ETB/)
    expect(out).toMatch(/1,234/)
  })
  it('formats dates and today', () => {
    expect(todayISO().length).toBe(10)
    expect(formatDate(null)).toBe('—')
  })
  it('maps statuses', () => {
    expect(appointmentStatusColor('CONFIRMED')).toContain('emerald')
    expect(invoiceStatusColor('PAID')).toContain('emerald')
    expect(appointmentStatusColor('UNKNOWN')).toBeTruthy()
  })
  it('makes initials', () => {
    expect(initials('Selam Tesfaye')).toBe('ST')
    expect(initials('Abebe')).toBe('AB')
    expect(initials(undefined)).toBe('·')
  })
})
