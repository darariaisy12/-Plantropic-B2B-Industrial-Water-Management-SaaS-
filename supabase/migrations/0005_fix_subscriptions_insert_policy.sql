-- Plantropic — fix subscriptions self-upgrade privilege escalation.
--
-- The original INSERT policy (0003_subscriptions.sql) only checked row
-- ownership (auth.uid() = user_id) and did NOT constrain `plan`/`status`/
-- `expires_at`. Since the anon key + a user's own session JWT can call the
-- Supabase REST API directly, any signed-up user could insert their own
-- subscriptions row with plan='enterprise', status='active' BEFORE the app's
-- own getSubscription() ever creates the trial row — granting themselves a
-- paid/Enterprise plan for free, permanently, with no payment or admin
-- involved.
--
-- Fix: the client-facing INSERT policy may only ever create the initial
-- trial row exactly as the app does. Any other plan/status is rejected by
-- RLS. Paid plans can only be set afterwards via the service-role client
-- (admin API / checkout demo), which bypasses RLS entirely by design.

drop policy if exists "subscriptions_insert_own" on public.subscriptions;
create policy "subscriptions_insert_own" on public.subscriptions
  for insert with check (
    auth.uid() = user_id
    and plan = 'trial'
    and status = 'active'
    and expires_at is null
  );
