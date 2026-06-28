import type { PlanId, PlanAccess, Subscription } from './types'

export function getEffectivePlan(sub: Subscription): PlanId {
  if (sub.plan === 'trial') {
    if (sub.trialEndsAt && new Date() > sub.trialEndsAt) return 'expired'
    return 'professional'
  }
  if (sub.status !== 'active') return 'expired'
  if (sub.expiresAt && new Date() > sub.expiresAt) return 'expired'
  return sub.plan
}

export function getPlanAccess(plan: PlanId): PlanAccess {
  if (plan === 'professional' || plan === 'enterprise') {
    return { canUseAiInsight: true, canViewHistory: true, assessmentsPerMonth: null, canDownloadReport: true }
  }
  if (plan === 'starter') {
    return { canUseAiInsight: false, canViewHistory: false, assessmentsPerMonth: 1, canDownloadReport: true }
  }
  return { canUseAiInsight: false, canViewHistory: false, assessmentsPerMonth: 0, canDownloadReport: false }
}

export function trialDaysRemaining(sub: Subscription): number {
  if (sub.plan !== 'trial' || !sub.trialEndsAt) return 0
  const diff = sub.trialEndsAt.getTime() - Date.now()
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)))
}
