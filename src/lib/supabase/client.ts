/**
 * Browser-side Supabase client for use in Client Components.
 *
 * Reads the public URL + anon key from NEXT_PUBLIC_* env vars. The anon key is
 * safe to expose: all access is constrained by Row Level Security policies.
 */

import { createBrowserClient } from '@supabase/ssr';

// Webpack only inlines NEXT_PUBLIC_* values when accessed as a static
// `process.env.NEXT_PUBLIC_X` member expression — `process.env[name]` via a
// dynamic name is never replaced and is always undefined in the browser.
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export function createClient() {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    throw new Error('Missing environment variable: NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY');
  }
  return createBrowserClient(SUPABASE_URL, SUPABASE_ANON_KEY);
}
