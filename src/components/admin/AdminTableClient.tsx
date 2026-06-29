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
          style={{ border: '1px solid rgba(57,123,64,0.2)', background: '#fff', color: '#1a2e1b' }}
        />
        <select
          value={planFilter}
          onChange={(e) => setPlanFilter(e.target.value)}
          className="text-sm px-3 py-2 rounded-xl outline-none"
          style={{ border: '1px solid rgba(57,123,64,0.2)', background: '#fff', color: '#374151' }}
        >
          {PLAN_FILTER_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>

      <div className="rounded-2xl overflow-hidden" style={{ background: '#fff', border: '1px solid rgba(57,123,64,0.12)' }}>
        <table className="w-full text-sm">
          <thead>
            <tr style={{ background: 'rgba(57,123,64,0.06)' }}>
              <th className="text-left px-4 py-3 font-semibold" style={{ color: '#397b40' }}>Perusahaan</th>
              <th className="text-left px-4 py-3 font-semibold" style={{ color: '#397b40' }}>Industri</th>
              <th className="text-left px-4 py-3 font-semibold" style={{ color: '#397b40' }}>Periode Terakhir</th>
              <th className="text-left px-4 py-3 font-semibold" style={{ color: '#397b40' }}>Plan</th>
              <th className="text-left px-4 py-3 font-semibold" style={{ color: '#397b40' }}>Trial Berakhir</th>
              <th className="text-right px-4 py-3 font-semibold" style={{ color: '#397b40' }}>Skor ESG</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr>
                <td className="px-4 py-6 text-center" colSpan={6} style={{ color: '#9ca3af' }}>
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
                    borderTop: '1px solid rgba(57,123,64,0.08)',
                    background: isUrgent ? 'rgba(220,38,38,0.03)' : undefined,
                  }}
                >
                  <td className="px-4 py-3 font-medium" style={{ color: '#1a2e1b' }}>{row.companyName}</td>
                  <td className="px-4 py-3" style={{ color: '#6b7280' }}>{row.industry ?? '—'}</td>
                  <td className="px-4 py-3" style={{ color: '#6b7280' }}>{row.latestPeriod ?? '—'}</td>
                  <td className="px-4 py-3">
                    <AdminPlanSelect userId={row.userId} currentPlan={row.plan} />
                  </td>
                  <td className="px-4 py-3 text-xs font-medium" style={{ color: isExpired ? '#b91c1c' : isUrgent ? '#d97706' : '#9ca3af' }}>
                    {days === null ? '—' : isExpired ? 'Expired' : `${days} hari lagi`}
                  </td>
                  <td className="px-4 py-3 text-right font-bold" style={{ color: '#397b40' }}>
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
