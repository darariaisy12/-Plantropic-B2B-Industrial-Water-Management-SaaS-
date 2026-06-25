-- Plantropic — initial schema (single-user: 1 account = 1 company)
-- Run this in the Supabase SQL Editor. Every table has Row Level Security ON
-- so a user can only ever touch rows where user_id = auth.uid().

-- ── companies ──────────────────────────────────────────────────────────────
create table if not exists public.companies (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null unique references auth.users (id) on delete cascade,
  name       text not null,
  industry   text,
  scale      text,
  created_at timestamptz not null default now()
);

-- ── assessments ────────────────────────────────────────────────────────────
create table if not exists public.assessments (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users (id) on delete cascade,
  period     text not null,
  weights    jsonb not null default '{}'::jsonb,
  inputs     jsonb not null default '{}'::jsonb,
  results    jsonb,
  created_at timestamptz not null default now()
);

create index if not exists assessments_user_id_idx on public.assessments (user_id);

-- ── ai_insights ────────────────────────────────────────────────────────────
-- user_id is denormalized so the RLS policy stays a simple auth.uid() check.
create table if not exists public.ai_insights (
  id            uuid primary key default gen_random_uuid(),
  assessment_id uuid not null references public.assessments (id) on delete cascade,
  user_id       uuid not null references auth.users (id) on delete cascade,
  content       text not null,
  model         text,
  created_at    timestamptz not null default now()
);

create index if not exists ai_insights_assessment_id_idx on public.ai_insights (assessment_id);

-- ── Row Level Security ─────────────────────────────────────────────────────
alter table public.companies   enable row level security;
alter table public.assessments enable row level security;
alter table public.ai_insights enable row level security;

-- companies
create policy "companies_select_own" on public.companies
  for select using (auth.uid() = user_id);
create policy "companies_insert_own" on public.companies
  for insert with check (auth.uid() = user_id);
create policy "companies_update_own" on public.companies
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "companies_delete_own" on public.companies
  for delete using (auth.uid() = user_id);

-- assessments
create policy "assessments_select_own" on public.assessments
  for select using (auth.uid() = user_id);
create policy "assessments_insert_own" on public.assessments
  for insert with check (auth.uid() = user_id);
create policy "assessments_update_own" on public.assessments
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "assessments_delete_own" on public.assessments
  for delete using (auth.uid() = user_id);

-- ai_insights
create policy "ai_insights_select_own" on public.ai_insights
  for select using (auth.uid() = user_id);
create policy "ai_insights_insert_own" on public.ai_insights
  for insert with check (auth.uid() = user_id);
create policy "ai_insights_update_own" on public.ai_insights
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "ai_insights_delete_own" on public.ai_insights
  for delete using (auth.uid() = user_id);
