-- 0001_init.sql
-- Initial schema for DANU Orthopaedic Center.
-- This migration is re-runnable for development.

create table if not exists user_profiles (
  id uuid primary key,
  email text not null unique,
  full_name text,
  role text not null default 'PATIENT',
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists patients (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  code text not null unique,
  first_name text not null,
  last_name text not null,
  email text,
  phone text,
  dob date,
  gender text,
  address text,
  blood_group text,
  allergies text,
  notes text,
  created_at timestamptz not null default now()
);
create index if not exists patients_phone_idx on patients(phone);
create index if not exists patients_code_idx on patients(code);

create table if not exists doctors (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  name text not null,
  specialty text not null,
  qualifications text not null default 'To be verified by administration',
  biography text not null default 'To be completed by administration.',
  experience text not null default 'To be verified',
  languages text not null default 'Amharic, English',
  photo_url text,
  available boolean not null default true,
  status text not null default 'DRAFT',
  created_at timestamptz not null default now()
);

create table if not exists services (
  id uuid primary key default gen_random_uuid(),
  category text not null,
  name text not null,
  description text not null,
  duration_minutes int not null default 30,
  price_etb numeric(12,2),
  image_url text,
  status text not null default 'DRAFT',
  created_at timestamptz not null default now()
);

create table if not exists schedules (
  id uuid primary key default gen_random_uuid(),
  doctor_id uuid not null references doctors(id) on delete cascade,
  weekday int not null check (weekday between 0 and 6),
  start_time time not null,
  end_time time not null,
  slot_minutes int not null default 30,
  active boolean not null default true
);

create table if not exists appointments (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references patients(id) on delete cascade,
  service_id uuid not null references services(id),
  doctor_id uuid references doctors(id),
  date date not null,
  time time not null,
  reason text not null,
  status text not null default 'REQUESTED',
  channel text not null default 'ONLINE',
  created_by uuid references auth.users(id),
  notes text,
  created_at timestamptz not null default now()
);
create index if not exists appointments_date_idx on appointments(date);
create index if not exists appointments_doctor_idx on appointments(doctor_id, date, time);

create table if not exists visits (
  id uuid primary key default gen_random_uuid(),
  appointment_id uuid references appointments(id) on delete set null,
  patient_id uuid not null references patients(id) on delete cascade,
  doctor_id uuid references auth.users(id),
  consultation_notes text,
  diagnosis text,
  treatment_plan text,
  follow_up_date date,
  completed_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists invoices (
  id uuid primary key default gen_random_uuid(),
  number text not null unique,
  patient_id uuid not null references patients(id) on delete cascade,
  patient_name text not null,
  items jsonb not null default '[]'::jsonb,
  subtotal numeric(12,2) not null default 0,
  paid numeric(12,2) not null default 0,
  total numeric(12,2) not null default 0,
  status text not null default 'UNPAID',
  note text,
  created_at timestamptz not null default now()
);

create table if not exists payments (
  id uuid primary key default gen_random_uuid(),
  invoice_id uuid not null references invoices(id) on delete cascade,
  amount numeric(12,2) not null,
  method text not null default 'CASH',
  reference text,
  recorded_by uuid references auth.users(id),
  created_at timestamptz not null default now()
);

create table if not exists notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  kind text not null,
  title text not null,
  message text not null,
  read boolean not null default false,
  created_at timestamptz not null default now()
);
create index if not exists notifications_user_idx on notifications(user_id, created_at desc);

create table if not exists audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid,
  actor_email text not null,
  action text not null,
  resource text not null,
  result text not null default 'SUCCESS',
  meta jsonb,
  created_at timestamptz not null default now()
);

create table if not exists content_blocks (
  id uuid primary key default gen_random_uuid(),
  key text not null unique,
  status text not null default 'DRAFT',
  title text not null,
  body text not null,
  updated_by uuid,
  updated_at timestamptz not null default now()
);

create table if not exists faq_items (
  id uuid primary key default gen_random_uuid(),
  question text not null,
  answer text not null,
  category text not null default 'General',
  status text not null default 'DRAFT',
  "order" int not null default 0
);

create table if not exists facilities (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text not null,
  image_url text,
  status text not null default 'DRAFT',
  "order" int not null default 0
);

create table if not exists articles (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  summary text not null,
  body text not null,
  cover_image_url text,
  author text not null default 'DANU Editorial',
  status text not null default 'DRAFT',
  published_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists settings (
  key text primary key,
  value jsonb not null,
  updated_at timestamptz not null default now()
);

-- RLS (every authenticated call still passes a bearer token, so policies are
-- the second line of defence behind the serverless API).

alter table user_profiles enable row level security;
alter table patients enable row level security;
alter table doctors enable row level security;
alter table services enable row level security;
alter table schedules enable row level security;
alter table appointments enable row level security;
alter table visits enable row level security;
alter table invoices enable row level security;
alter table payments enable row level security;
alter table notifications enable row level security;
alter table audit_logs enable row level security;
alter table content_blocks enable row level security;
alter table faq_items enable row level security;
alter table facilities enable row level security;
alter table articles enable row level security;

create policy "public_can_read_published_services" on services for select using (status = 'PUBLISHED');
create policy "public_can_read_published_doctors" on doctors for select using (status = 'PUBLISHED');
create policy "public_can_read_published_facilities" on facilities for select using (status = 'PUBLISHED');
create policy "public_can_read_published_faq" on faq_items for select using (status = 'PUBLISHED');
create policy "public_can_read_published_articles" on articles for select using (status = 'PUBLISHED');
create policy "public_can_read_published_blocks" on content_blocks for select using (status = 'PUBLISHED');

create policy "users_read_own_profile" on user_profiles for select using (auth.uid() = id);
create policy "users_update_own_profile" on user_profiles for update using (auth.uid() = id);

create policy "patients_read_own" on patients for select using (auth.uid() = user_id);
create policy "notifications_owner_only" on notifications for select using (auth.uid() = user_id);
create policy "notifications_owner_update" on notifications for update using (auth.uid() = user_id);

create policy "appointments_owner_read" on appointments for select using (auth.uid()::text = patient_id::text);
create policy "visits_owner_read" on visits for select using (auth.uid()::text = patient_id::text);
create policy "invoices_owner_read" on invoices for select using (auth.uid()::text = patient_id::text);
