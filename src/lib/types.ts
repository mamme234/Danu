// Shared types between the frontend and the API layer. These mirror the
// Postgres columns defined in `supabase/migrations/0001_init.sql`.

export type AppRole =
  | 'SUPER_ADMIN'
  | 'ADMIN'
  | 'DOCTOR'
  | 'NURSE'
  | 'RECEPTIONIST'
  | 'ACCOUNTANT'
  | 'CONTENT_MANAGER'
  | 'PATIENT'

export type AppointmentStatus =
  | 'REQUESTED'
  | 'CONFIRMED'
  | 'RESCHEDULED'
  | 'CANCELLED'
  | 'COMPLETED'
  | 'NO_SHOW'
  | 'CHECKED_IN'

export type InvoiceStatus = 'UNPAID' | 'PARTIALLY_PAID' | 'PAID' | 'CANCELLED'

export type ContentStatus = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED'

export interface UserProfile {
  id: string
  email: string
  full_name: string
  role: AppRole
  active: boolean
  created_at: string
}

export interface Patient {
  id: string
  user_id: string | null
  code: string
  first_name: string
  last_name: string
  email: string | null
  phone: string
  dob: string | null
  gender: string | null
  address: string | null
  blood_group?: string | null
  allergies?: string | null
  notes?: string | null
  created_at: string
}

export interface Doctor {
  id: string
  user_id: string | null
  name: string
  specialty: string
  qualifications: string
  biography: string
  experience: string
  languages: string
  photo_url: string | null
  status: 'PUBLISHED' | 'DRAFT' | 'ARCHIVED'
  available: boolean
  created_at: string
}

export interface Service {
  id: string
  category:
    | 'Orthopaedic Consultation'
    | 'Fracture & Trauma Care'
    | 'Joint Conditions'
    | 'Bone & Muscle Conditions'
    | 'Orthopaedic Diagnostics'
    | 'Surgical Consultation'
    | 'Rehabilitation & Referral'
  name: string
  description: string
  duration_minutes: number
  price_etb: number | null
  status: 'PUBLISHED' | 'DRAFT' | 'ARCHIVED'
  image_url: string | null
  created_at: string
}

export interface Schedule {
  id: string
  doctor_id: string
  weekday: number // 0..6
  start_time: string // HH:MM
  end_time: string
  slot_minutes: number
  active: boolean
}

export interface Appointment {
  id: string
  patient_id: string
  service_id: string
  doctor_id: string | null
  date: string // YYYY-MM-DD
  time: string // HH:MM
  reason: string
  status: AppointmentStatus
  channel: 'ONLINE' | 'WALK_IN' | 'PHONE' | 'STAFF'
  created_by: string | null
  notes: string | null
  created_at: string
}

export interface Visit {
  id: string
  appointment_id: string
  patient_id: string
  doctor_id: string | null
  consultation_notes: string | null
  diagnosis: string | null
  treatment_plan: string | null
  follow_up_date: string | null
  completed_at: string | null
  created_at: string
}

export interface InvoiceItem {
  description: string
  qty: number
  unit: number
}

export interface Invoice {
  id: string
  number: string
  patient_id: string
  patient_name: string
  items: InvoiceItem[]
  subtotal: number
  paid: number
  total: number
  status: InvoiceStatus
  note: string | null
  created_at: string
}

export interface Payment {
  id: string
  invoice_id: string
  amount: number
  method: 'CASH' | 'BANK' | 'TELEBIRR' | 'CHAPA' | 'OTHER'
  reference: string | null
  recorded_by: string | null
  created_at: string
}

export interface NotificationItem {
  id: string
  user_id: string
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
  read: boolean
  created_at: string
}

export interface AuditLog {
  id: string
  actor_id: string | null
  actor_email: string
  action: string
  resource: string
  result: 'SUCCESS' | 'DENIED' | 'ERROR'
  meta: Record<string, unknown> | null
  created_at: string
}

export interface ContentBlock {
  id: string
  key: string // e.g. 'home.hero', 'contact.info'
  status: ContentStatus
  title: string
  body: string
  updated_by: string | null
  updated_at: string
}

export interface FaqItem {
  id: string
  question: string
  answer: string
  category: string
  status: ContentStatus
  order: number
}

export interface Article {
  id: string
  slug: string
  title: string
  summary: string
  body: string
  cover_image_url: string | null
  author: string
  status: ContentStatus
  published_at: string | null
  created_at: string
}

export interface Facility {
  id: string
  name: string
  description: string
  image_url: string | null
  order: number
  status: ContentStatus
}
