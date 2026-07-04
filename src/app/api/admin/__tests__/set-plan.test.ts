import { describe, expect, test, vi, beforeEach } from 'vitest';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { requireAdmin } from '@/lib/supabase/requireAdmin';
import { createSupabaseChain, type SupabaseResult } from '@/test-utils/supabaseMock';
import { POST } from '../set-plan/route';

vi.mock('@/lib/supabase/server', () => ({ createClient: vi.fn() }));
vi.mock('@/lib/supabase/admin', () => ({ createAdminClient: vi.fn() }));
vi.mock('@/lib/supabase/requireAdmin', () => ({ requireAdmin: vi.fn() }));

const VALID_USER_ID = '11111111-1111-4111-8111-111111111111';

function makeRequest(body: unknown): Request {
  return new Request('http://localhost/api/admin/set-plan', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

beforeEach(() => {
  vi.mocked(createClient).mockResolvedValue({} as never);
});

describe('POST /api/admin/set-plan', () => {
  test('returns 401 when unauthenticated', async () => {
    vi.mocked(requireAdmin).mockResolvedValue({ ok: false, reason: 'unauthenticated' });
    const res = await POST(makeRequest({ userId: VALID_USER_ID, plan: 'starter' }));
    expect(res.status).toBe(401);
  });

  test('returns 403 when the signed-in user is not an admin', async () => {
    vi.mocked(requireAdmin).mockResolvedValue({ ok: false, reason: 'forbidden' });
    const res = await POST(makeRequest({ userId: VALID_USER_ID, plan: 'starter' }));
    expect(res.status).toBe(403);
  });

  test('returns 400 for an invalid body', async () => {
    vi.mocked(requireAdmin).mockResolvedValue({ ok: true, user: { id: 'admin-1', email: 'a@x.com' } as never });
    const res = await POST(makeRequest({ userId: 'not-a-uuid', plan: 'starter' }));
    expect(res.status).toBe(400);
  });

  test('upserts the subscription and writes an audit log on success', async () => {
    vi.mocked(requireAdmin).mockResolvedValue({ ok: true, user: { id: 'admin-1', email: 'a@x.com' } as never });

    const resultByTable: Record<string, SupabaseResult> = {
      subscriptions: { data: { plan: 'trial' }, error: null },
      companies: { data: { name: 'PT Sample' }, error: null },
      admin_audit_logs: { data: null, error: null },
    };
    const fromMock = vi.fn((table: string) => createSupabaseChain(resultByTable[table] ?? { data: null, error: null }));
    vi.mocked(createAdminClient).mockReturnValue({ from: fromMock } as never);

    const res = await POST(makeRequest({ userId: VALID_USER_ID, plan: 'professional' }));

    expect(res.status).toBe(200);
    expect(fromMock).toHaveBeenCalledWith('subscriptions');
    expect(fromMock).toHaveBeenCalledWith('admin_audit_logs');
  });

  test('returns 500 when the subscription upsert fails', async () => {
    vi.mocked(requireAdmin).mockResolvedValue({ ok: true, user: { id: 'admin-1', email: 'a@x.com' } as never });

    const fromMock = vi.fn(() => createSupabaseChain({ data: null, error: { message: 'db down' } }));
    vi.mocked(createAdminClient).mockReturnValue({ from: fromMock } as never);

    const res = await POST(makeRequest({ userId: VALID_USER_ID, plan: 'professional' }));
    expect(res.status).toBe(500);
  });
});
