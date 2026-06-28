export type PlanId = 'trial' | 'starter' | 'professional' | 'enterprise' | 'expired'

export interface Subscription {
  plan: PlanId
  status: 'active' | 'expired' | 'cancelled'
  trialEndsAt: Date | null
  expiresAt: Date | null
}

export interface PlanAccess {
  canUseAiInsight: boolean
  canViewHistory: boolean
  assessmentsPerMonth: number | null
  canDownloadReport: boolean
}

export const PLAN_LABELS: Record<PlanId, string> = {
  trial: 'Trial',
  starter: 'Starter',
  professional: 'Professional',
  enterprise: 'Enterprise',
  expired: 'Expired',
}

export const PLAN_PRICES: Partial<Record<PlanId, string>> = {
  starter: 'Rp5.000.000',
  professional: 'Rp18.000.000',
  enterprise: 'Custom',
}

export const PLAN_FEATURES: Partial<Record<PlanId, string[]>> = {
  starter: [
    'ESG Calculator dasar',
    'Dashboard analytics',
    'Laporan ESG (download PDF)',
    '1 assessment per bulan',
    'Support via email',
  ],
  professional: [
    'Semua fitur Starter',
    'AI Recommendations & Insight',
    'Riwayat & Tren multi-periode',
    'Assessment unlimited',
    'Priority support',
  ],
  enterprise: [
    'Semua fitur Professional',
    'Custom ESG framework',
    'Dedicated account manager',
    'On-premise deployment',
    'Training & onboarding',
  ],
}
