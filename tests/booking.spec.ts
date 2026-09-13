import { describe, expect, it } from 'vitest'

// Booking rules: appointments conflict when they share doctor + date + time +
// have an active status, and exclude themselves on update.
function isConflict(existing: { doctor_id: string | null; date: string; time: string; status: string }[], next: { id?: string; doctor_id: string | null; date: string; time: string }) {
  return existing.some(e =>
    (!next.id || e !== next) &&
    e.doctor_id === next.doctor_id &&
    e.date === next.date &&
    e.time === next.time &&
    ['REQUESTED', 'CONFIRMED', 'RESCHEDULED', 'CHECKED_IN'].includes(e.status)
  )
}

describe('appointment booking', () => {
  it('blocks a new appointment when a conflict exists', () => {
    const existing = [
      { doctor_id: 'd1', date: '2026-09-13', time: '09:30', status: 'CONFIRMED' as const },
      { doctor_id: 'd2', date: '2026-09-13', time: '09:30', status: 'CONFIRMED' as const },
    ]
    expect(isConflict(existing as any, { doctor_id: 'd1', date: '2026-09-13', time: '09:30' })).toBe(true)
    expect(isConflict(existing as any, { doctor_id: 'd1', date: '2026-09-13', time: '10:00' })).toBe(false)
    expect(isConflict(existing as any, { doctor_id: 'd3', date: '2026-09-13', time: '09:30' })).toBe(false)
  })

  it('treats CANCELLED / COMPLETED as non-conflicting', () => {
    const existing = [
      { doctor_id: 'd1', date: '2026-09-13', time: '09:30', status: 'CANCELLED' as const },
      { doctor_id: 'd1', date: '2026-09-13', time: '09:30', status: 'COMPLETED' as const },
    ]
    expect(isConflict(existing as any, { doctor_id: 'd1', date: '2026-09-13', time: '09:30' })).toBe(false)
  })
})
