# RLS & storage policies

The repo ships the migrations in `supabase/migrations`. To activate storage and
additional Row-Level Security (RLS) policies after the schema is loaded:

1. Storage bucket `documents` (private). Files are read through signed URLs
   minted by `/api/documents/sign`.
2. `doctors` and `services` policies restrict write access to roles
   `SUPER_ADMIN`, `ADMIN`, `CONTENT_MANAGER`.
3. `audit_logs` policies grant SELECT to roles `SUPER_ADMIN`, `ADMIN` only —
   and explicitly no INSERT/UPDATE/DELETE from the client.

Run after migrations:

```sql
insert into storage.buckets (id, name, public) values ('documents', 'documents', false) on conflict do nothing;

create policy "documents_owner_select" on storage.objects for select using (bucket_id = 'documents');
create policy "documents_staff_insert" on storage.objects for insert with check (
  bucket_id = 'documents'
  and auth.jwt() ->> 'role' in ('SUPER_ADMIN','ADMIN','DOCTOR','NURSE','RECEPTIONIST')
);

create policy "audit_logs_admins_read" on audit_logs for select using (
  auth.jwt() ->> 'role' in ('SUPER_ADMIN','ADMIN')
);
```

All production secrets live in Vercel, never in source code.
