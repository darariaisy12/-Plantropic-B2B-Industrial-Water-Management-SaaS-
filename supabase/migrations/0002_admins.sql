-- Plantropic — admin role table.
-- A user is an admin iff a row exists here with their auth.uid(). The admin
-- dashboard itself reads ALL companies/assessments via the service-role key
-- server-side (bypassing RLS by design) — this table only gates who is
-- allowed to call that server route, it is not used to bypass RLS itself.

create table if not exists public.admins (
  user_id    uuid primary key references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);

alter table public.admins enable row level security;

-- A signed-in user may only check whether THEIR OWN id is an admin row —
-- never list or see other users' admin status.
drop policy if exists "admins_select_own" on public.admins;
create policy "admins_select_own" on public.admins
  for select using (auth.uid() = user_id);

-- To make yourself the first admin, run in the Supabase SQL Editor:
--   insert into public.admins (user_id) values ('<your-auth-uid>');
