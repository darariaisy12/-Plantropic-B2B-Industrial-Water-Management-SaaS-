/**
 * Assessment input route. Auth-guarded server component (no session → /login);
 * the interactive form itself is a client component so the ESG score can
 * recompute live as the user types.
 */

import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getSubscription } from '@/lib/subscription/getSubscription';
import AssessmentWizard from '@/components/assessment/AssessmentWizard';
import UpgradePrompt from '@/components/subscription/UpgradePrompt';

export default async function AssessmentPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const { access } = await getSubscription();

  if (access.assessmentsPerMonth !== null) {
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const { count } = await supabase
      .from('assessments')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', startOfMonth.toISOString());

    if ((count ?? 0) >= access.assessmentsPerMonth) {
      return (
        <main className="min-h-screen" style={{ background: '#F8FAFC' }}>
          <UpgradePrompt feature={`Assessment (limit ${access.assessmentsPerMonth}/bulan tercapai)`} />
        </main>
      );
    }
  }

  return (
    <main className="min-h-screen" style={{ background: '#F8FAFC' }}>
      <AssessmentWizard />
    </main>
  );
}
