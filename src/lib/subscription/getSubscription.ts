import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import type { PlanId, Subscription, PlanAccess } from './types'
import { getEffectivePlan, getPlanAccess } from './planGate'

export interface SubscriptionState {
  sub: Subscription
  effectivePlan: PlanId
  access: PlanAccess
}

export async function getSubscription(): Promise<SubscriptionState> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data } = await supabase
    .from('subscriptions')
    .select('plan, status, trial_ends_at, expires_at')
    .eq('user_id', user.id)
    .maybeSingle()

  let sub: Subscription
  if (!data) {
    const trialEndsAt = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)
    await supabase.from('subscriptions').insert({
      user_id: user.id,
      plan: 'trial',
      status: 'active',
      trial_ends_at: trialEndsAt.toISOString(),
    })
    sub = { plan: 'trial', status: 'active', trialEndsAt, expiresAt: null }
  } else {
    sub = {
      plan: data.plan as PlanId,
      status: data.status as 'active' | 'expired' | 'cancelled',
      trialEndsAt: data.trial_ends_at ? new Date(data.trial_ends_at) : null,
      expiresAt: data.expires_at ? new Date(data.expires_at) : null,
    }
  }

  const effectivePlan = getEffectivePlan(sub)
  return { sub, effectivePlan, access: getPlanAccess(effectivePlan) }
}
