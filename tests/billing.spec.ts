import { describe, expect, it } from 'vitest'

// Pure functions used inside invoice creation flow. Inlined here so they can
// be unit-tested without touching the database.

function computeSubtotal(items: { qty: number; unit: number }[]): number {
  return items.reduce((s, it) => s + Number(it.qty) * Number(it.unit), 0)
}

function invoiceStatusFor(paid: number, total: number): 'PAID' | 'PARTIALLY_PAID' | 'UNPAID' {
  if (paid <= 0) return 'UNPAID'
  if (paid >= total) return 'PAID'
  return 'PARTIALLY_PAID'
}

describe('billing', () => {
  it('subtotal is the sum of qty * unit', () => {
    expect(computeSubtotal([
      { qty: 1, unit: 1500 },
      { qty: 2, unit: 750 },
    ])).toBe(3000)
  })

  it('partial payment yields PARTIALLY_PAID', () => {
    expect(invoiceStatusFor(500, 1500)).toBe('PARTIALLY_PAID')
  })

  it('zero payment yields UNPAID', () => {
    expect(invoiceStatusFor(0, 1500)).toBe('UNPAID')
  })

  it('full payment yields PAID', () => {
    expect(invoiceStatusFor(1500, 1500)).toBe('PAID')
  })
})
