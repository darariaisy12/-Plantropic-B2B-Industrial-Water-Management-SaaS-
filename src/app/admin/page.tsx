/**
 * Admin dashboard — lists every company and its latest ESG score across all
 * users. Guarded twice: no session -> /login; session but not in `admins`
 * -> /dashboard. Only after both checks does it use the service-role client
 * to read across users (which RLS would otherwise block).
 */

import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { PLAN_LABELS } from '@/lib/subscription/types';
import type { PlanId } from '@/lib/subscription/types';
import type { EsgResult } from '@/lib/esg/types';

interface CompanyRow {
  user_id: string;
  name: string;
  industry: string | null;
  scale: string | null;
}

interface AssessmentRow {
  user_id: string;
  period: string;
  results: EsgResult | null;
  created_at: string;
}

interface SubscriptionRow {
  user_id: string;
  plan: string;
}

export default async function AdminPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const { data: adminRow } = await supabase
    .from('admins')
    .select('user_id')
    .eq('user_id', user.id)
    .maybeSingle();

  if (!adminRow) {
    redirect('/dashboard');
  }

  const admin = createAdminClient();
  const [{ data: companies }, { data: assessments }, { data: subscriptions }] = await Promise.all([
    admin.from('companies').select('user_id, name, industry, scale'),
    admin
      .from('assessments')
      .select('user_id, period, results, created_at')
      .order('created_at', { ascending: false }),
    admin.from('subscriptions').select('user_id, plan'),
  ]);

  const latestByUser = new Map<string, AssessmentRow>();
  for (const row of (assessments as AssessmentRow[] | null) ?? []) {
    if (!latestByUser.has(row.user_id)) {
      latestByUser.set(row.user_id, row);
    }
  }

  const planByUser = new Map<string, string>();
  for (const row of (subscriptions as SubscriptionRow[] | null) ?? []) {
    planByUser.set(row.user_id, row.plan);
  }

  const rows = ((companies as CompanyRow[] | null) ?? []).map((company) => ({
    company,
    latest: latestByUser.get(company.user_id) ?? null,
    plan: planByUser.get(company.user_id) ?? 'trial',
  }));

  return (
    <main className="min-h-screen" style={{ background: '#F8FAFC' }}>
      <div className="w-full max-w-5xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between gap-4 mb-6">
          <div>
            <h1
              className="text-2xl font-bold"
              style={{ color: '#1a2e1b', fontFamily: 'Plus Jakarta Sans, DM Sans, sans-serif' }}
            >
              Admin — Semua Perusahaan
            </h1>
            <p className="text-sm mt-1" style={{ color: '#6b7280' }}>
              {rows.length} perusahaan terdaftar.
            </p>
          </div>
          <Link href="/dashboard" className="text-xs font-semibold" style={{ color: '#397b40' }}>
            ← Dashboard saya
          </Link>
        </div>

        <div
          className="rounded-2xl overflow-hidden"
          style={{ background: 'rgba(255,255,255,0.85)', border: '1px solid rgba(57,123,64,0.12)' }}
        >
          <table className="w-full text-sm">
            <thead>
              <tr style={{ background: 'rgba(57,123,64,0.06)' }}>
                <th className="text-left px-4 py-3 font-semibold" style={{ color: '#374151' }}>
                  Perusahaan
                </th>
                <th className="text-left px-4 py-3 font-semibold" style={{ color: '#374151' }}>
                  Industri
                </th>
                <th className="text-left px-4 py-3 font-semibold" style={{ color: '#374151' }}>
                  Periode Terakhir
                </th>
                <th className="text-left px-4 py-3 font-semibold" style={{ color: '#374151' }}>
                  Plan
                </th>
                <th className="text-right px-4 py-3 font-semibold" style={{ color: '#374151' }}>
                  Skor ESG
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 && (
                <tr>
                  <td className="px-4 py-6 text-center" colSpan={4} style={{ color: '#9ca3af' }}>
                    Belum ada perusahaan terdaftar.
                  </td>
                </tr>
              )}
              {rows.map(({ company, latest, plan }) => (
                <tr key={company.user_id} style={{ borderTop: '1px solid rgba(0,0,0,0.06)' }}>
                  <td className="px-4 py-3" style={{ color: '#1a2e1b' }}>
                    {company.name}
                  </td>
                  <td className="px-4 py-3" style={{ color: '#6b7280' }}>
                    {company.industry ?? '—'}
                  </td>
                  <td className="px-4 py-3" style={{ color: '#6b7280' }}>
                    {latest?.period ?? '—'}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className="px-2 py-0.5 rounded-full text-[11px] font-bold"
                      style={{
                        background: plan === 'professional' || plan === 'enterprise' ? 'rgba(57,123,64,0.12)' : 'rgba(0,0,0,0.06)',
                        color: plan === 'professional' || plan === 'enterprise' ? '#397b40' : '#6b7280',
                      }}
                    >
                      {PLAN_LABELS[plan as PlanId] ?? plan}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right font-bold" style={{ color: '#397b40' }}>
                    {latest?.results ? latest.results.overall.toFixed(1) : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}
