-- Plantropic — enforce the Starter plan's "1 assessment / month" quota at
-- the database layer.
--
-- Previously this limit was only checked when rendering the /assessment
-- Server Component (src/app/assessment/page.tsx). The actual write
-- (saveAssessment in src/lib/data/assessments.ts) runs client-side against
-- Supabase directly, and the assessments INSERT policy only checks row
-- ownership — so a Starter user could bypass the monthly cap entirely by
-- calling the Supabase REST API directly (or scripting multiple inserts
-- before the page-level check re-renders). This mirrors the plan logic in
-- src/lib/subscription/planGate.ts so the DB is now the source of truth,
-- not just the UI.

create or replace function public.enforce_assessment_quota()
returns trigger
language plpgsql
security invoker
set search_path = public
as $$
declare
  v_plan text;
  v_status text;
  v_expires_at timestamptz;
  v_trial_ends_at timestamptz;
  v_effective_unlimited boolean;
  v_monthly_limit integer;
  v_count integer;
  v_month_start timestamptz;
begin
  select plan, status, expires_at, trial_ends_at
    into v_plan, v_status, v_expires_at, v_trial_ends_at
    from public.subscriptions
    where user_id = new.user_id;

  -- No subscription row yet (shouldn't normally happen — trial row is
  -- created on first dashboard visit) — fail closed rather than silently
  -- allow unlimited assessments.
  if v_plan is null then
    raise exception 'Belum ada langganan aktif untuk user ini.'
      using errcode = 'P0001';
  end if;

  -- Mirrors getEffectivePlan(): trial counts as unlimited while still
  -- within its window; expired trial/subscription gets zero quota.
  if v_plan = 'trial' then
    if v_trial_ends_at is not null and now() > v_trial_ends_at then
      v_monthly_limit := 0;
      v_effective_unlimited := false;
    else
      v_effective_unlimited := true;
    end if;
  elsif v_status <> 'active' or (v_expires_at is not null and now() > v_expires_at) then
    v_monthly_limit := 0;
    v_effective_unlimited := false;
  elsif v_plan in ('professional', 'enterprise') then
    v_effective_unlimited := true;
  elsif v_plan = 'starter' then
    v_monthly_limit := 1;
    v_effective_unlimited := false;
  else
    v_monthly_limit := 0;
    v_effective_unlimited := false;
  end if;

  if v_effective_unlimited then
    return new;
  end if;

  v_month_start := date_trunc('month', now());

  select count(*) into v_count
    from public.assessments
    where user_id = new.user_id
      and created_at >= v_month_start;

  if v_count >= v_monthly_limit then
    raise exception 'Batas assessment bulanan untuk plan ini sudah tercapai.'
      using errcode = 'P0001';
  end if;

  return new;
end;
$$;

drop trigger if exists assessments_enforce_quota on public.assessments;
create trigger assessments_enforce_quota
  before insert on public.assessments
  for each row
  execute function public.enforce_assessment_quota();
