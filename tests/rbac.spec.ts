import { describe, expect, it } from 'vitest'
import { ROLE_PERMS, roleHas } from '../src/lib/supabase'

describe('rbac', () => {
  it('super admin has every permission', () => {
    expect(roleHas('SUPER_ADMIN', 'billing.write')).toBe(true)
    expect(roleHas('SUPER_ADMIN', 'record.write')).toBe(true)
  })

  it('receptionist cannot edit clinical records', () => {
    expect(roleHas('RECEPTIONIST', 'record.write')).toBe(false)
    expect(roleHas('RECEPTIONIST', 'billing.write')).toBe(false)
  })

  it('accountant cannot edit clinical records', () => {
    expect(roleHas('ACCOUNTANT', 'record.write')).toBe(false)
    expect(roleHas('ACCOUNTANT', 'content.write')).toBe(false)
  })

  it('content manager cannot manage billing', () => {
    expect(roleHas('CONTENT_MANAGER', 'billing.write')).toBe(false)
    expect(roleHas('CONTENT_MANAGER', 'staff.write')).toBe(false)
  })

  it('patient only sees their own data permissions', () => {
    expect(roleHas('PATIENT', 'appointment.read')).toBe(true)
    expect(roleHas('PATIENT', 'billing.write')).toBe(false)
    expect(roleHas('PATIENT', 'staff.write')).toBe(false)
  })

  it('role permission map is complete', () => {
    expect(Object.keys(ROLE_PERMS)).toEqual(expect.arrayContaining([
      'SUPER_ADMIN', 'ADMIN', 'DOCTOR', 'NURSE', 'RECEPTIONIST', 'ACCOUNTANT', 'CONTENT_MANAGER', 'PATIENT',
    ]))
  })
})
