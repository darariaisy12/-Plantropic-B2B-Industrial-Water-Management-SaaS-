/**
 * Dashboard — protected entry point after login. Renders the ESG dashboard
 * (score ring, pillar bars, element radar, emission breakdown, AI insight
 * placeholder) for the latest saved assessment. Guarded server-side: no
 * session → /login.
 */

import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import DashboardView from '@/components/dashboard/DashboardView';

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
    <main className="min-h-screen" style={{ background: '#F8FAFC' }}>
      <header
        className="sticky top-0 z-10 backdrop-blur"
        style={{ background: 'rgba(248,250,252,0.85)', borderBottom: '1px solid rgba(57,123,64,0.12)' }}
      >
        <div className="w-full max-w-5xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
          <span
            className="text-sm font-extrabold tracking-tight"
            style={{ color: '#1a2e1b', fontFamily: 'Plus Jakarta Sans, DM Sans, sans-serif' }}
          >
            🌱 Plantropic
          </span>
          <nav className="flex items-center gap-1 text-xs font-semibold" style={{ color: '#397b40' }}>
            <Link href="/history" className="px-3 py-1.5 rounded-lg transition-colors hover:bg-[rgba(57,123,64,0.08)]">
              Riwayat
            </Link>
            <Link href="/settings" className="px-3 py-1.5 rounded-lg transition-colors hover:bg-[rgba(57,123,64,0.08)]">
              Pengaturan
            </Link>
            <form action="/auth/signout" method="post">
              <button type="submit" className="px-3 py-1.5 rounded-lg transition-colors hover:bg-[rgba(57,123,64,0.08)]">
                Sign out
              </button>
            </form>
          </nav>
        </div>
      </header>
      <DashboardView displayName={displayName} />
    </main>
  );
}
