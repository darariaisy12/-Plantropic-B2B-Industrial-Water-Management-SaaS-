-- Plantropic — admin audit log.
-- Every plan change made through the admin dashboard is recorded here.
-- Writes happen via the service-role key (bypasses RLS); only admins may read.

create table if not exists public.admin_audit_logs (
  id                  uuid        primary key default gen_random_uuid(),
  admin_user_id       uuid        not null,
  admin_email         text,
  target_user_id      uuid        not null,
  target_company_name text,
  action              text        not null,   -- e.g. 'set_plan'
  old_value           text,                   -- plan before change
  new_value           text        not null,   -- plan after change
  created_at          timestamptz not null default now()
);

alter table public.admin_audit_logs enable row level security;

-- Only admins (rows in public.admins) may read the log.
drop policy if exists "admins_read_audit_logs" on public.admin_audit_logs;
create policy "admins_read_audit_logs" on public.admin_audit_logs
  for select using (
    exists (
      select 1 from public.admins where user_id = auth.uid()
    )
  );

-- Writes come exclusively from the service-role key; no authenticated INSERT policy needed.
