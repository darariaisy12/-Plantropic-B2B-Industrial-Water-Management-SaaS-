/**
 * Report — protected entry point for the GRI-style sustainability report.
 * Guarded server-side: no session → /login.
 */

import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import ReportView from '@/components/report/ReportView';

export default async function ReportPage() {
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
      <ReportView displayName={displayName} />
    </main>
  );
}
