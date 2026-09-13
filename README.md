# DANU Orthopaedic Center — Public Website & Healthcare Management Platform

A premium, internationally-styled orthopaedic centre web platform that pairs a
public marketing site with a secure healthcare management system. The product
is split into two surfaces:

- **Public website** – marketing, services, doctors, facilities, patient
  information, appointment booking, FAQ, news/articles, contact, legal pages.
- **Operations platform** – authentication, RBAC, patients, doctors, staff,
  appointments, scheduling, reception queues, doctor and nurse workflows,
  electronic medical records, ETB invoicing, payments, CMS, notifications,
  audit logs, reports.

The repository ships everything required to run the application: frontend,
Vercel-compatible API, database schema/migrations, seed data, ops
documentation, deployment instructions and a GitHub publishing helper.

> ⚠️ Compliance note — Only doctors, prices, equipment, success rates and other
> clinical/operational metrics that have been verified by DANU Orthopaedic
> Center are published. Unverified records render with a “To be confirmed by
> administration” badge and remain in draft.

## Tech stack

| Layer        | Choice                                      |
|--------------|---------------------------------------------|
| Frontend     | Vite + React 19 + TypeScript + Tailwind v4  |
| Routing      | React Router (public + authed areas)        |
| Backend API  | Vercel serverless functions (`/api/*`)      |
| Database     | Postgres (Supabase) with RLS                |
| Auth         | Supabase Auth + custom RBAC                 |
| Email/SMS    | Pluggable via `lib/notifications.ts`        |
| Payments     | Pluggable ETB gateway (ready for Telebirr, Chapa, etc.) |
| Tests        | Vitest                                      |

## Quick start

```bash
# 1. Install
npm install

# 2. Configure
cp .env.example .env.local
# fill NEXT_PUBLIC/VITE and server-side secrets

# 3. Migrate + seed the database
npm run db:migrate
npm run db:seed

# 4. Local dev
npm run dev

# 5. Build + deploy to Vercel
npm run build
vercel deploy --prod
```

## Directory layout

```
api/                 Vercel serverless endpoints (Supabase-backed)
src/                 React application
  components/        Reusable UI primitives
  context/           Auth, RBAC, notifications
  lib/               Supabase clients, helpers, types
  pages/             Top-level routes
    public/          Public marketing pages
    portal/          Patient, doctor, nurse, reception, billing, admin
  styles.css         Design tokens (CSS variables)
scripts/             Operational scripts (publish-github, db migrate, db seed)
supabase/
  migrations/        Timestamped SQL migrations
  seed/              Demo seed data, clearly flagged
vercel.json          Vercel routing & rewrites
tests/               Vitest unit tests
```

## Roles

`SUPER_ADMIN` → `ADMIN` → `DOCTOR` | `NURSE` | `RECEPTIONIST` | `ACCOUNTANT` |
`CONTENT_MANAGER` | `PATIENT`.

Role enforcement happens **server-side** in every API route. Receptionists do
not have access to clinical record mutations; accountants do not edit clinical
data; content managers do not touch billing. Audit logs are immutable.

## Security & privacy

- All PHI routes sit behind Supabase RLS plus a per-request JWT check on the
  serverless layer.
- Documents are read through short-lived signed URLs.
- No payment, email or SMS is sent without an explicit provider implementation.
- Audit logs capture who did what, when, with what result.

## Deployment

1. Push to GitHub (use `npm run publish:github` or your CI/CD).
2. Create a Vercel project and import the repository.
3. Configure the environment variables from `.env.example`.
4. Run `npm run db:migrate` and `npm run db:seed` against your Supabase
   project.
5. Apply the audit, RLS and storage policies located in
   `supabase/policies/`.

## Testing

```bash
npm run test
```

Vitest covers the key business rules:

- `tests/rbac.spec.ts` — role/permission resolution
- `tests/booking.spec.ts` — appointment booking & conflict rules
- `tests/billing.spec.ts` — invoice status transitions & ETB totals
- `tests/audit.spec.ts` — audit logging contract

## Disclaimer

Demo data (users, doctors, services, invoices, articles) is loaded by the
seed script for development. It must be replaced before going live. The
system **never** fakes payments, medical diagnoses, sends unverifiable
emails/SMS, or hard-codes doctor qualifications.
