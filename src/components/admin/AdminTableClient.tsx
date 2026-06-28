'use client'

import { useState } from 'react'
import AdminPlanSelect from './AdminPlanSelect'

export interface AdminRow {
  userId: string
  companyName: string
  industry: string | null
  latestPeriod: string | null
  latestScore: number | null
  plan: string
  trialEndsAt: string | null
}

interface AdminTableClientProps {
  rows: AdminRow[]
}

const PLAN_FILTER_OPTIONS = [
  { value: '', label: 'Semua plan' },
  { value: 'trial', label: 'Trial' },
  { value: 'starter', label: 'Starter' },
  { value: 'professional', label: 'Professional' },
  { value: 'enterprise', label: 'Enterprise' },
  { value: 'expired', label: 'Expired' },
]

function trialDaysLeft(trialEndsAt: string | null): number | null {
  if (!trialEndsAt) return null
  const diff = new Date(trialEndsAt).getTime() - Date.now()
  return Math.ceil(diff / (1000 * 60 * 60 * 24))
}

export default function AdminTableClient({ rows }: AdminTableClientProps) {
  const [search, setSearch] = useState('')
  const [planFilter, setPlanFilter] = useState('')

  const filtered = rows.filter((r) => {
    const matchSearch = r.companyName.toLowerCase().includes(search.toLowerCase())
    const matchPlan = planFilter === '' || r.plan === planFilter
    return matchSearch && matchPlan
  })

  return (
    <div>
      <div className="flex gap-3 mb-4 flex-wrap">
        <input
          type="text"
          placeholder="Cari perusahaan..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="text-sm px-3 py-2 rounded-xl outline-none flex-1 min-w-[160px]"
          style={{ border: '1px solid rgba(74,222,128,0.2)', background: 'rgba(255,255,255,0.07)', color: '#fff', backdropFilter: 'blur(8px)' }}
        />
        <select
          value={planFilter}
          onChange={(e) => setPlanFilter(e.target.value)}
          className="text-sm px-3 py-2 rounded-xl outline-none"
          style={{ border: '1px solid rgba(74,222,128,0.2)', background: 'rgba(255,255,255,0.07)', color: '#d1fae5' }}
        >
          {PLAN_FILTER_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value} style={{ background: '#1a3d1c', color: '#fff' }}>{opt.label}</option>
          ))}
        </select>
      </div>

      <div className="rounded-2xl overflow-hidden" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(74,222,128,0.15)', backdropFilter: 'blur(12px)' }}>
        <table className="w-full text-sm">
          <thead>
            <tr style={{ background: 'rgba(74,222,128,0.08)' }}>
              <th className="text-left px-4 py-3 font-semibold" style={{ color: '#86efac' }}>Perusahaan</th>
              <th className="text-left px-4 py-3 font-semibold" style={{ color: '#86efac' }}>Industri</th>
              <th className="text-left px-4 py-3 font-semibold" style={{ color: '#86efac' }}>Periode Terakhir</th>
              <th className="text-left px-4 py-3 font-semibold" style={{ color: '#86efac' }}>Plan</th>
              <th className="text-left px-4 py-3 font-semibold" style={{ color: '#86efac' }}>Trial Berakhir</th>
              <th className="text-right px-4 py-3 font-semibold" style={{ color: '#86efac' }}>Skor ESG</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr>
                <td className="px-4 py-6 text-center" colSpan={6} style={{ color: 'rgba(255,255,255,0.3)' }}>
                  Tidak ada data.
                </td>
              </tr>
            )}
            {filtered.map((row) => {
              const days = row.plan === 'trial' ? trialDaysLeft(row.trialEndsAt) : null
              const isUrgent = days !== null && days <= 3
              const isExpired = days !== null && days <= 0

              return (
                <tr
                  key={row.userId}
                  style={{
                    borderTop: '1px solid rgba(74,222,128,0.08)',
                    background: isUrgent ? 'rgba(220,38,38,0.08)' : undefined,
                  }}
                >
                  <td className="px-4 py-3 font-medium text-white">{row.companyName}</td>
                  <td className="px-4 py-3" style={{ color: 'rgba(255,255,255,0.5)' }}>{row.industry ?? '—'}</td>
                  <td className="px-4 py-3" style={{ color: 'rgba(255,255,255,0.5)' }}>{row.latestPeriod ?? '—'}</td>
                  <td className="px-4 py-3">
                    <AdminPlanSelect userId={row.userId} currentPlan={row.plan} />
                  </td>
                  <td className="px-4 py-3 text-xs font-medium" style={{ color: isExpired ? '#f87171' : isUrgent ? '#fbbf24' : 'rgba(255,255,255,0.3)' }}>
                    {days === null ? '—' : isExpired ? 'Expired' : `${days} hari lagi`}
                  </td>
                  <td className="px-4 py-3 text-right font-bold" style={{ color: '#4ade80' }}>
                    {row.latestScore !== null ? row.latestScore.toFixed(1) : '—'}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
