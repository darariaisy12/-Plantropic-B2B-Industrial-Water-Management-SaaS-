'use client'

import Link from 'next/link'

interface TrialBannerProps {
  daysRemaining: number
}

export default function TrialBanner({ daysRemaining }: TrialBannerProps) {
  if (daysRemaining <= 0) return null

  const urgent = daysRemaining <= 3

  return (
    <div
      className="w-full py-2 px-4 text-center text-xs font-semibold flex items-center justify-center gap-3"
      style={{
        background: urgent ? 'rgba(220,38,38,0.08)' : 'rgba(57,123,64,0.08)',
        borderBottom: `1px solid ${urgent ? 'rgba(220,38,38,0.2)' : 'rgba(57,123,64,0.15)'}`,
        color: urgent ? '#b91c1c' : '#397b40',
      }}
    >
      <span>
        {urgent
          ? `⚠️ Trial berakhir dalam ${daysRemaining} hari lagi!`
          : `🌱 Trial aktif — ${daysRemaining} hari tersisa`}
      </span>
      <Link
        href="/upgrade"
        className="px-3 py-1 rounded-full font-bold text-white text-[11px] transition-opacity hover:opacity-90"
        style={{ background: urgent ? '#b91c1c' : '#397b40' }}
      >
        Upgrade sekarang
      </Link>
    </div>
  )
}
