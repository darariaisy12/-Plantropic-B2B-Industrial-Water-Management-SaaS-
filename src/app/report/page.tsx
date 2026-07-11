/**
 * Report — protected entry point for the GRI-style sustainability report.
 * Guarded server-side: no session → /login. Passes canUseAiInsight so
 * ReportView can gate the AI summary section without a separate client call.
 */

import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getLatestAssessment } from '@/lib/data/assessments';
import { getSubscription } from '@/lib/subscription/getSubscription';
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

  const [{ access }, companyResult, assessment] = await Promise.all([
    getSubscription(),
    supabase.from('companies').select('name, industry').maybeSingle(),
    getLatestAssessment(supabase),
  ]);

  if (!access.canDownloadReport) {
    redirect('/dashboard?upgrade=report');
  }

  const companyName = (companyResult.data?.name as string | null) ?? null;

  return (
    <main className="min-h-screen" style={{ background: '#F8FAFC' }}>
      <ReportView
        displayName={displayName}
        canUseAiInsight={access.canUseAiInsight}
        companyName={companyName}
        assessment={assessment}
      />
    </main>
  );
}
