/**
 * Browser-side Supabase client for use in Client Components.
 *
 * Reads the public URL + anon key from NEXT_PUBLIC_* env vars. The anon key is
 * safe to expose: all access is constrained by Row Level Security policies.
 */

import { createBrowserClient } from '@supabase/ssr';

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing environment variable: ${name}`);
  }
  return value;
}

export function createClient() {
  return createBrowserClient(
    requireEnv('NEXT_PUBLIC_SUPABASE_URL'),
    requireEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY'),
  );
}
