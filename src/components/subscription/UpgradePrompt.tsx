'use client'

import Link from 'next/link'

interface UpgradePromptProps {
  feature: string
}

export default function UpgradePrompt({ feature }: UpgradePromptProps) {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
      <div
        className="rounded-2xl px-8 py-10 max-w-sm w-full"
        style={{ background: 'rgba(255,255,255,0.85)', border: '1px solid rgba(57,123,64,0.15)' }}
      >
        <div className="text-4xl mb-4">🔒</div>
        <h2 className="text-lg font-bold mb-2" style={{ color: '#1a2e1b' }}>
          Fitur {feature} tersedia di Professional
        </h2>
        <p className="text-sm mb-6" style={{ color: '#6b7280' }}>
          Upgrade plan kamu untuk mengakses fitur ini dan semua keunggulan Plantropic.
        </p>
        <Link
          href="/upgrade"
          className="inline-block w-full py-3 rounded-full font-bold text-sm text-white text-center transition-opacity hover:opacity-90"
          style={{ background: '#397b40' }}
        >
          Lihat Pilihan Plan
        </Link>
        <Link
          href="/dashboard"
          className="inline-block mt-3 text-xs font-medium"
          style={{ color: '#9ca3af' }}
        >
          ← Kembali ke dashboard
        </Link>
      </div>
    </div>
  )
}
