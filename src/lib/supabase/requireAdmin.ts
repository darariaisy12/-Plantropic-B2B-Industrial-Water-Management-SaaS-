/**
 * Shared admin-gate check: session must exist AND the user must have a row
 * in `public.admins`. Used by both the admin dashboard page and admin API
 * routes so the gate logic — and its RLS-backed query — lives in one place.
 */

import type { SupabaseClient, User } from '@supabase/supabase-js';

export type AdminCheckResult =
  | { ok: true; user: User }
  | { ok: false; reason: 'unauthenticated' }
  | { ok: false; reason: 'forbidden' };

export async function requireAdmin(supabase: SupabaseClient): Promise<AdminCheckResult> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false, reason: 'unauthenticated' };
  }

  const { data: adminRow } = await supabase
    .from('admins')
    .select('user_id')
    .eq('user_id', user.id)
    .maybeSingle();

  if (!adminRow) {
    return { ok: false, reason: 'forbidden' };
  }

  return { ok: true, user };
}
