import { describe, expect, test, vi } from 'vitest';
import type { SupabaseClient, User } from '@supabase/supabase-js';
import { createSupabaseChain } from '@/test-utils/supabaseMock';
import { requireAdmin } from '../requireAdmin';

function mockSupabase(user: Partial<User> | null, adminRow: { user_id: string } | null): SupabaseClient {
  return {
    auth: { getUser: vi.fn().mockResolvedValue({ data: { user } }) },
    from: vi.fn(() => createSupabaseChain({ data: adminRow, error: null })),
  } as unknown as SupabaseClient;
}

describe('requireAdmin', () => {
  test('returns unauthenticated when there is no session', async () => {
    const supabase = mockSupabase(null, null);
    expect(await requireAdmin(supabase)).toEqual({ ok: false, reason: 'unauthenticated' });
  });

  test('returns forbidden when the signed-in user has no admins row', async () => {
    const supabase = mockSupabase({ id: 'user-1' }, null);
    expect(await requireAdmin(supabase)).toEqual({ ok: false, reason: 'forbidden' });
  });

  test('returns ok with the user when an admins row exists', async () => {
    const user = { id: 'user-1' };
    const supabase = mockSupabase(user, { user_id: 'user-1' });
    expect(await requireAdmin(supabase)).toEqual({ ok: true, user });
  });
});
