'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

const PLAN_OPTIONS = [
  { value: 'trial', label: 'Trial' },
  { value: 'starter', label: 'Starter' },
  { value: 'professional', label: 'Professional' },
  { value: 'enterprise', label: 'Enterprise' },
  { value: 'expired', label: 'Expired' },
]

interface AdminPlanSelectProps {
  userId: string
  currentPlan: string
}

export default function AdminPlanSelect({ userId, currentPlan }: AdminPlanSelectProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [value, setValue] = useState(currentPlan)

  async function handleChange(newPlan: string) {
    if (newPlan === value) return
    setLoading(true)
    try {
      const res = await fetch('/api/admin/set-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, plan: newPlan }),
      })
      if (res.ok) {
        setValue(newPlan)
        router.refresh()
      }
    } finally {
      setLoading(false)
    }
  }

  const isPaid = value === 'professional' || value === 'enterprise'

  return (
    <select
      value={value}
      onChange={(e) => handleChange(e.target.value)}
      disabled={loading}
      className="text-[11px] font-bold rounded-full px-2 py-0.5 border-0 cursor-pointer disabled:opacity-50"
      style={{
        background: isPaid ? 'rgba(57,123,64,0.12)' : value === 'expired' ? 'rgba(220,38,38,0.1)' : 'rgba(0,0,0,0.06)',
        color: isPaid ? '#397b40' : value === 'expired' ? '#b91c1c' : '#6b7280',
      }}
    >
      {PLAN_OPTIONS.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {loading && opt.value === value ? 'Saving...' : opt.label}
        </option>
      ))}
    </select>
  )
}
