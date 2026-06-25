/**
 * Assessment input route. Auth-guarded server component (no session → /login);
 * the interactive form itself is a client component so the ESG score can
 * recompute live as the user types.
 */

import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import AssessmentWizard from '@/components/assessment/AssessmentWizard';

export default async function AssessmentPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  return (
    <main className="min-h-screen" style={{ background: '#F8FAFC' }}>
      <AssessmentWizard />
    </main>
  );
}
