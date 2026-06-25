/**
 * Settings — protected entry point for company profile management (Fase 9).
 * Guarded server-side: no session → /login.
 */

import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import SettingsView from '@/components/settings/SettingsView';

export default async function SettingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  return (
    <main className="min-h-screen" style={{ background: '#F8FAFC' }}>
      <SettingsView />
    </main>
  );
}
