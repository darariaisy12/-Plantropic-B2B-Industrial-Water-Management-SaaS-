/**
 * Admin dashboard — cross-user view of all companies, subscriptions, and ESG
 * scores. Double-gated: session check + admins table RLS, then service-role
 * client for cross-user reads.
 */

import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import AdminTableClient from '@/components/admin/AdminTableClient'
import type { AdminRow } from '@/components/admin/AdminTableClient'
import type { EsgResult } from '@/lib/esg/types'

interface CompanyRow {
  user_id: string
  name: string
  industry: string | null
}

interface AssessmentRow {
  user_id: string
  period: string
  results: EsgResult | null
  created_at: string
}

interface SubscriptionRow {
  user_id: string
  plan: string
  status: string
  trial_ends_at: string | null
}

function StatCard({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
  return (
    <div
      className="rounded-2xl px-5 py-4"
      style={{ background: 'rgba(255,255,255,0.85)', border: '1px solid rgba(57,123,64,0.12)' }}
    >
      <div className="text-2xl font-extrabold" style={{ color: '#1a2e1b' }}>{value}</div>
      <div className="text-xs font-semibold mt-0.5" style={{ color: '#6b7280' }}>{label}</div>
      {sub && <div className="text-[11px] mt-1" style={{ color: '#9ca3af' }}>{sub}</div>}
    </div>
  )
}

export default async function AdminPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: adminRow } = await supabase
    .from('admins')
    .select('user_id')
    .eq('user_id', user.id)
    .maybeSingle()

  if (!adminRow) redirect('/dashboard')

  const admin = createAdminClient()
  const [{ data: companies }, { data: assessments }, { data: subscriptions }] = await Promise.all([
    admin.from('companies').select('user_id, name, industry'),
    admin.from('assessments').select('user_id, period, results, created_at').order('created_at', { ascending: false }),
    admin.from('subscriptions').select('user_id, plan, status, trial_ends_at'),
  ])

  const latestByUser = new Map<string, AssessmentRow>()
  for (const row of (assessments as AssessmentRow[] | null) ?? []) {
    if (!latestByUser.has(row.user_id)) latestByUser.set(row.user_id, row)
  }

  const subByUser = new Map<string, SubscriptionRow>()
  for (const row of (subscriptions as SubscriptionRow[] | null) ?? []) {
    subByUser.set(row.user_id, row)
  }

  const rows: AdminRow[] = ((companies as CompanyRow[] | null) ?? []).map((company) => {
    const latest = latestByUser.get(company.user_id) ?? null
    const sub = subByUser.get(company.user_id)
    return {
      userId: company.user_id,
      companyName: company.name,
      industry: company.industry,
      latestPeriod: latest?.period ?? null,
      latestScore: latest?.results?.overall ?? null,
      plan: sub?.plan ?? 'trial',
      trialEndsAt: sub?.trial_ends_at ?? null,
    }
  })

  const now = Date.now()
  const totalUsers = rows.length
  const trialActive = rows.filter((r) => r.plan === 'trial' && r.trialEndsAt && new Date(r.trialEndsAt).getTime() > now).length
  const trialExpiringSoon = rows.filter((r) => {
    if (r.plan !== 'trial' || !r.trialEndsAt) return false
    const diff = new Date(r.trialEndsAt).getTime() - now
    return diff > 0 && diff <= 3 * 24 * 60 * 60 * 1000
  }).length
  const paidUsers = rows.filter((r) => r.plan === 'starter' || r.plan === 'professional' || r.plan === 'enterprise').length
  const totalAssessments = (assessments as AssessmentRow[] | null)?.length ?? 0

  return (
    <main className="min-h-screen" style={{ background: '#F8FAFC' }}>
      <div className="w-full max-w-5xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold" style={{ color: '#1a2e1b', fontFamily: 'Plus Jakarta Sans, DM Sans, sans-serif' }}>
              Admin Dashboard
            </h1>
            <p className="text-sm mt-1" style={{ color: '#6b7280' }}>
              Monitor dan kelola semua user Plantropic.
            </p>
          </div>
          <Link href="/dashboard" className="text-xs font-semibold" style={{ color: '#397b40' }}>
            ← Dashboard saya
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <StatCard label="Total User" value={totalUsers} />
          <StatCard label="Trial Aktif" value={trialActive} sub={trialExpiringSoon > 0 ? `⚠️ ${trialExpiringSoon} expires ≤3 hari` : undefined} />
          <StatCard label="User Berbayar" value={paidUsers} />
          <StatCard label="Total Assessment" value={totalAssessments} />
        </div>

        <AdminTableClient rows={rows} />
      </div>
    </main>
  )
}
