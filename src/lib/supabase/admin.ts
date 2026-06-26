/**
 * Service-role Supabase client — bypasses RLS entirely. Server-only, never
 * imported by a 'use client' component. Used exclusively by the admin
 * dashboard to read across all users' companies/assessments; every caller
 * MUST check the `admins` table for the current session before touching this.
 */

import { createClient as createSupabaseClient } from '@supabase/supabase-js';

function requireServerEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing environment variable: ${name}`);
  }
  return value;
}

export function createAdminClient() {
  return createSupabaseClient(
    requireServerEnv('NEXT_PUBLIC_SUPABASE_URL'),
    requireServerEnv('SUPABASE_SERVICE_ROLE_KEY'),
    { auth: { autoRefreshToken: false, persistSession: false } },
  );
}
