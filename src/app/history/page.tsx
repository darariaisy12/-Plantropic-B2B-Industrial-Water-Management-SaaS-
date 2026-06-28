/**
 * History — protected entry point for the assessment trend view (Fase 8).
 * Guarded server-side: no session → /login.
 */

import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import HistoryView from '@/components/history/HistoryView';
import UpgradePrompt from '@/components/subscription/UpgradePrompt';
import { getSubscription } from '@/lib/subscription/getSubscription';

export default async function HistoryPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const { access } = await getSubscription();

  return (
    <main className="min-h-screen" style={{ background: '#F8FAFC' }}>
      {access.canViewHistory ? <HistoryView /> : <UpgradePrompt feature="Riwayat & Tren" />}
    </main>
  );
}
