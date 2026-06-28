import { NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

const bodySchema = z.object({
  plan: z.enum(['starter', 'professional']),
})

export async function POST(request: Request): Promise<NextResponse> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Sesi tidak ditemukan.' }, { status: 401 })
  }

  const body = await request.json().catch(() => null)
  const parsed = bodySchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Plan tidak valid.' }, { status: 400 })
  }

  const expiresAt = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)

  const admin = createAdminClient()
  const { error } = await admin.from('subscriptions').upsert(
    {
      user_id: user.id,
      plan: parsed.data.plan,
      status: 'active',
      expires_at: expiresAt.toISOString(),
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'user_id' },
  )

  if (error) {
    return NextResponse.json({ error: 'Gagal mengaktifkan plan.' }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
