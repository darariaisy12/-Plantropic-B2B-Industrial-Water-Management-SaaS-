import { NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { requireAdmin } from '@/lib/supabase/requireAdmin'

const bodySchema = z.object({
  userId: z.string().uuid(),
  plan: z.enum(['trial', 'starter', 'professional', 'enterprise', 'expired']),
})

export async function POST(request: Request): Promise<NextResponse> {
  const supabase = await createClient()
  const check = await requireAdmin(supabase)
  if (!check.ok) {
    return check.reason === 'unauthenticated'
      ? NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      : NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }
  const { user } = check

  const body = await request.json().catch(() => null)
  const parsed = bodySchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Input tidak valid.' }, { status: 400 })
  }

  const { userId, plan } = parsed.data
  const isExpired = plan === 'expired'
  const expiresAt = isExpired
    ? new Date(Date.now() - 1000).toISOString()
    : plan === 'trial'
      ? null
      : new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()

  const admin = createAdminClient()

  const [{ data: existingSub }, { data: company }] = await Promise.all([
    admin.from('subscriptions').select('plan').eq('user_id', userId).maybeSingle(),
    admin.from('companies').select('name').eq('user_id', userId).maybeSingle(),
  ])
  const oldPlan = (existingSub as { plan: string } | null)?.plan ?? null
  const companyName = (company as { name: string } | null)?.name ?? null

  const { error } = await admin.from('subscriptions').upsert(
    {
      user_id: userId,
      plan: isExpired ? 'starter' : plan,
      status: isExpired ? 'expired' : 'active',
      expires_at: expiresAt,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'user_id' },
  )

  if (error) {
    return NextResponse.json({ error: 'Gagal mengubah plan.' }, { status: 500 })
  }

  // Write audit log — fire-and-forget, never blocks the plan change.
  Promise.resolve(
    admin.from('admin_audit_logs').insert({
      admin_user_id: user.id,
      admin_email: user.email ?? null,
      target_user_id: userId,
      target_company_name: companyName,
      action: 'set_plan',
      old_value: oldPlan,
      new_value: plan,
    }),
  ).catch(() => {})

  return NextResponse.json({ success: true })
}
