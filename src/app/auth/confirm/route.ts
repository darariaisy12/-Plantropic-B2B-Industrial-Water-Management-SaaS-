/**
 * Email confirmation handler. Supabase emails a link to /auth/confirm with a
 * token_hash; we exchange it for a session, then redirect into the app. Only
 * needed when "Confirm email" is enabled in the Supabase auth settings.
 */

import { type EmailOtpType } from '@supabase/supabase-js';
import { NextResponse, type NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';

const DEFAULT_NEXT_PATH = '/dashboard';

/**
 * Only allow same-origin, relative redirect targets. Rejects absolute URLs
 * (`https://evil.example`) and protocol-relative URLs (`//evil.example`),
 * which would otherwise let `new URL(next, base)` resolve off-site — an
 * open-redirect vector immediately after a successful OTP verification.
 */
function sanitizeNextPath(next: string | null): string {
  if (!next) return DEFAULT_NEXT_PATH;
  if (!next.startsWith('/') || next.startsWith('//')) return DEFAULT_NEXT_PATH;
  return next;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const tokenHash = searchParams.get('token_hash');
  const type = searchParams.get('type') as EmailOtpType | null;
  const next = sanitizeNextPath(searchParams.get('next'));

  if (tokenHash && type) {
    const supabase = await createClient();
    const { error } = await supabase.auth.verifyOtp({ type, token_hash: tokenHash });
    if (!error) {
      return NextResponse.redirect(new URL(next, request.url));
    }
  }

  return NextResponse.redirect(new URL('/login?error=confirm', request.url));
}
