import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getSubscription } from '@/lib/subscription/getSubscription'
import { PLAN_LABELS, PLAN_PRICES, PLAN_FEATURES } from '@/lib/subscription/types'
import type { PlanId } from '@/lib/subscription/types'

const UPGRADE_PLANS: PlanId[] = ['starter', 'professional', 'enterprise']

export default async function UpgradePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { effectivePlan } = await getSubscription()

  return (
    <main className="min-h-screen" style={{ background: '#F8FAFC' }}>
      <div className="w-full max-w-4xl mx-auto px-4 py-12">
        <div className="text-center mb-10">
          <Link href="/dashboard" className="text-xs font-semibold" style={{ color: '#9ca3af' }}>
            ← Kembali ke dashboard
          </Link>
          <h1 className="text-2xl font-extrabold mt-4 mb-2" style={{ color: '#1a2e1b' }}>
            Pilih Plan yang Tepat
          </h1>
          <p className="text-sm" style={{ color: '#6b7280' }}>
            Semua harga per tahun, belum termasuk PPN 11%.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {UPGRADE_PLANS.map((plan) => {
            const isPro = plan === 'professional'
            const isCurrent = effectivePlan === plan
            const isEnterprise = plan === 'enterprise'

            return (
              <div
                key={plan}
                className="rounded-2xl p-6 flex flex-col"
                style={{
                  background: isPro ? 'linear-gradient(135deg,#397b40,#2d6233)' : 'rgba(255,255,255,0.9)',
                  border: isPro ? 'none' : '1px solid rgba(57,123,64,0.15)',
                  color: isPro ? '#fff' : '#1a2e1b',
                }}
              >
                {isPro && (
                  <span className="text-[10px] font-bold uppercase tracking-widest mb-3 opacity-70">
                    Most Popular
                  </span>
                )}
                <div className="font-extrabold text-lg mb-1">{PLAN_LABELS[plan]}</div>
                <div className="text-2xl font-extrabold mb-4">
                  {PLAN_PRICES[plan]}
                  {!isEnterprise && <span className="text-sm font-normal opacity-70">/tahun</span>}
                </div>

                <ul className="flex flex-col gap-2 mb-6 flex-1">
                  {(PLAN_FEATURES[plan] ?? []).map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm">
                      <span className="mt-0.5 shrink-0" style={{ color: isPro ? 'rgba(255,255,255,0.7)' : '#397b40' }}>✓</span>
                      <span style={{ color: isPro ? 'rgba(255,255,255,0.9)' : '#374151' }}>{f}</span>
                    </li>
                  ))}
                </ul>

                {isCurrent ? (
                  <div
                    className="w-full py-3 rounded-full text-center text-sm font-bold"
                    style={{ background: 'rgba(0,0,0,0.1)', color: isPro ? '#fff' : '#6b7280' }}
                  >
                    Plan aktif
                  </div>
                ) : isEnterprise ? (
                  <a
                    href="mailto:plantropic.lab@gmail.com?subject=Enterprise Plan Inquiry"
                    className="w-full py-3 rounded-full text-center text-sm font-bold transition-opacity hover:opacity-90 block"
                    style={{ background: 'rgba(57,123,64,0.1)', color: '#397b40' }}
                  >
                    Hubungi Sales
                  </a>
                ) : (
                  <Link
                    href={`/checkout/${plan}`}
                    className="w-full py-3 rounded-full text-center text-sm font-bold transition-opacity hover:opacity-90 block"
                    style={{
                      background: isPro ? '#fff' : '#397b40',
                      color: isPro ? '#397b40' : '#fff',
                    }}
                  >
                    Pilih {PLAN_LABELS[plan]}
                  </Link>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </main>
  )
}
