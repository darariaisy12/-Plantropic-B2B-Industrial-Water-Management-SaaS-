import { describe, expect, test, vi } from 'vitest';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { createSupabaseChain } from '@/test-utils/supabaseMock';
import { POST } from '../confirm/route';

vi.mock('@/lib/supabase/server', () => ({ createClient: vi.fn() }));
vi.mock('@/lib/supabase/admin', () => ({ createAdminClient: vi.fn() }));

function makeRequest(body: unknown): Request {
  return new Request('http://localhost/api/checkout/confirm', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

function mockServerClient(user: { id: string } | null) {
  vi.mocked(createClient).mockResolvedValue({
    auth: { getUser: vi.fn().mockResolvedValue({ data: { user } }) },
  } as never);
}

describe('POST /api/checkout/confirm', () => {
  test('returns 401 when there is no session', async () => {
    mockServerClient(null);
    const res = await POST(makeRequest({ plan: 'starter' }));
    expect(res.status).toBe(401);
  });

  test('returns 400 for an invalid plan', async () => {
    mockServerClient({ id: 'user-1' });
    const res = await POST(makeRequest({ plan: 'enterprise' }));
    expect(res.status).toBe(400);
  });

  test('activates the plan on success', async () => {
    mockServerClient({ id: 'user-1' });
    const fromMock = vi.fn(() => createSupabaseChain({ data: null, error: null }));
    vi.mocked(createAdminClient).mockReturnValue({ from: fromMock } as never);

    const res = await POST(makeRequest({ plan: 'professional' }));

    expect(res.status).toBe(200);
    expect(fromMock).toHaveBeenCalledWith('subscriptions');
  });

  test('returns 500 when the upsert fails', async () => {
    mockServerClient({ id: 'user-1' });
    const fromMock = vi.fn(() => createSupabaseChain({ data: null, error: { message: 'db down' } }));
    vi.mocked(createAdminClient).mockReturnValue({ from: fromMock } as never);

    const res = await POST(makeRequest({ plan: 'starter' }));
    expect(res.status).toBe(500);
  });
});
