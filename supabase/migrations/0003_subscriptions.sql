-- Plantropic — subscriptions table.
-- Tracks plan per user. App layer creates a 'trial' row on first dashboard visit
-- if one doesn't exist. Admin upgrades via /api/admin/set-plan (service-role).

create table if not exists public.subscriptions (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null unique references auth.users (id) on delete cascade,
  plan          text not null default 'trial'
                  check (plan in ('trial', 'starter', 'professional', 'enterprise')),
  status        text not null default 'active'
                  check (status in ('active', 'expired', 'cancelled')),
  trial_ends_at timestamptz not null default now() + interval '14 days',
  expires_at    timestamptz,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

alter table public.subscriptions enable row level security;

drop policy if exists "subscriptions_select_own" on public.subscriptions;
create policy "subscriptions_select_own" on public.subscriptions
  for select using (auth.uid() = user_id);

drop policy if exists "subscriptions_insert_own" on public.subscriptions;
create policy "subscriptions_insert_own" on public.subscriptions
  for insert with check (auth.uid() = user_id);

-- Users cannot update their own subscription — only admin (service-role) can.
-- No update policy intentionally.
