/**
 * Dashboard — protected entry point after login. For now it's a placeholder
 * that proves auth works end-to-end; the real ESG dashboard (rings, charts,
 * AI panel) lands in a later phase. Guarded server-side: no session → /login.
 */

import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const displayName =
    (user.user_metadata?.full_name as string | undefined) ?? user.email ?? 'there';

  return (
    <main
      className="min-h-screen flex items-center justify-center px-4"
      style={{ background: '#F8FAFC' }}
    >
      <div
        className="w-full max-w-lg text-center"
        style={{
          background: 'rgba(255,255,255,0.8)',
          border: '1px solid rgba(57,123,64,0.15)',
          borderRadius: '24px',
          boxShadow: '0 8px 40px rgba(57,123,64,0.10)',
          padding: '40px 32px',
        }}
      >
        <span className="text-4xl">🌱</span>
        <h1
          className="text-2xl font-bold mt-4"
          style={{ color: '#1a2e1b', fontFamily: 'Plus Jakarta Sans, DM Sans, sans-serif' }}
        >
          Halo, {displayName}!
        </h1>
        <p className="text-sm mt-2" style={{ color: '#6b7280' }}>
          Kamu berhasil login. Dashboard ESG (skor, chart, insight AI) akan tampil di sini.
        </p>

        <Link
          href="/assessment"
          className="inline-block mt-8 px-6 py-3 rounded-xl text-sm font-bold tracking-wide transition-all duration-300"
          style={{
            background: 'linear-gradient(135deg, #397b40 0%, #2d6233 100%)',
            color: '#ffffff',
            boxShadow: '0 4px 16px rgba(57,123,64,0.35)',
            fontFamily: 'Plus Jakarta Sans, DM Sans, sans-serif',
          }}
        >
          Mulai Assessment ESG
        </Link>

        <form action="/auth/signout" method="post" className="mt-4">
          <button
            type="submit"
            className="px-6 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300"
            style={{
              background: 'rgba(57,123,64,0.08)',
              color: '#397b40',
              fontFamily: 'Plus Jakarta Sans, DM Sans, sans-serif',
            }}
          >
            Sign out
          </button>
        </form>
      </div>
    </main>
  );
}
