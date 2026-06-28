'use client'

import { useParams, useRouter } from 'next/navigation'
import { useState } from 'react'
import Link from 'next/link'
import { PLAN_LABELS, PLAN_PRICES } from '@/lib/subscription/types'
import type { PlanId } from '@/lib/subscription/types'

const VALID_PLANS: PlanId[] = ['starter', 'professional']

export default function CheckoutPage() {
  const params = useParams()
  const router = useRouter()
  const plan = params.plan as string
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (!VALID_PLANS.includes(plan as PlanId)) {
    return (
      <main className="min-h-screen flex items-center justify-center" style={{ background: '#F8FAFC' }}>
        <div className="text-center">
          <p className="text-sm mb-4" style={{ color: '#6b7280' }}>Plan tidak ditemukan.</p>
          <Link href="/upgrade" className="text-sm font-semibold" style={{ color: '#397b40' }}>
            ← Kembali ke pilihan plan
          </Link>
        </div>
      </main>
    )
  }

  const planId = plan as PlanId
  const label = PLAN_LABELS[planId]
  const price = PLAN_PRICES[planId]

  async function handleConfirm() {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/checkout/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: planId }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        setError((data as { error?: string }).error ?? 'Gagal memproses pembayaran.')
        return
      }
      router.push('/dashboard?upgraded=1')
    } catch {
      setError('Terjadi kesalahan jaringan.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-4" style={{ background: '#F8FAFC' }}>
      <div
        className="w-full max-w-sm rounded-2xl p-8"
        style={{ background: 'rgba(255,255,255,0.9)', border: '1px solid rgba(57,123,64,0.15)' }}
      >
        <Link href="/upgrade" className="text-xs font-medium" style={{ color: '#9ca3af' }}>
          ← Kembali
        </Link>

        <h1 className="text-xl font-extrabold mt-4 mb-1" style={{ color: '#1a2e1b' }}>
          Checkout — {label}
        </h1>
        <p className="text-xs mb-6" style={{ color: '#6b7280' }}>
          Demo mode: pembayaran langsung dikonfirmasi tanpa gateway.
        </p>

        <div
          className="rounded-xl p-4 mb-6"
          style={{ background: 'rgba(57,123,64,0.06)', border: '1px solid rgba(57,123,64,0.12)' }}
        >
          <div className="flex justify-between items-center text-sm font-semibold" style={{ color: '#1a2e1b' }}>
            <span>Plan {label}</span>
            <span>{price}/tahun</span>
          </div>
          <div className="text-xs mt-1" style={{ color: '#6b7280' }}>Berlaku 1 tahun sejak aktivasi</div>
        </div>

        {error && (
          <p className="text-xs mb-4 text-red-600 font-medium">{error}</p>
        )}

        <button
          onClick={handleConfirm}
          disabled={loading}
          className="w-full py-3.5 rounded-full font-bold text-sm text-white transition-opacity hover:opacity-90 disabled:opacity-60"
          style={{ background: '#397b40' }}
        >
          {loading ? 'Memproses...' : 'Konfirmasi Pembayaran'}
        </button>

        <p className="text-[10px] text-center mt-4" style={{ color: '#9ca3af' }}>
          Ini adalah simulasi pembayaran. Tidak ada transaksi nyata yang terjadi.
        </p>
      </div>
    </main>
  )
}
