/**
 * Sign-out handler. Posted from the dashboard logout form; clears the Supabase
 * session and redirects to the login page. 303 forces the redirect to GET.
 */

import { NextResponse, type NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  await supabase.auth.signOut();
  return NextResponse.redirect(new URL('/login', request.url), { status: 303 });
}
