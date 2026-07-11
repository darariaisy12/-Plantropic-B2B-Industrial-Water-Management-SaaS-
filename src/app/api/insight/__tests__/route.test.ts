import { describe, expect, test, vi, beforeEach } from 'vitest';
import { createClient } from '@/lib/supabase/server';
import { getSubscription } from '@/lib/subscription/getSubscription';
import { POST } from '../route';

vi.mock('@/lib/supabase/server', () => ({ createClient: vi.fn() }));
vi.mock('@/lib/subscription/getSubscription', () => ({ getSubscription: vi.fn() }));

const createCompletion = vi.fn();
vi.mock('groq-sdk', () => ({
  default: vi.fn().mockImplementation(function MockGroq() {
    return { chat: { completions: { create: createCompletion } } };
  }),
}));

const validBody = {
  period: '2026-Q1',
  results: {
    overall: 72,
    pillars: [{ pillar: 'E', score: 70 }],
    elements: [{ elementId: 'E1', score: 70 }],
  },
};

function makeRequest(body: unknown, headers?: Record<string, string>): Request {
  return new Request('http://localhost/api/insight', { method: 'POST', body: JSON.stringify(body), headers });
}

function mockUser(user: { id: string } | null) {
  vi.mocked(createClient).mockResolvedValue({
    auth: { getUser: vi.fn().mockResolvedValue({ data: { user } }) },
  } as never);
}

beforeEach(() => {
  vi.stubEnv('GROQ_API_KEY', 'test-key');
  vi.mocked(getSubscription).mockResolvedValue({ access: { canUseAiInsight: true } } as never);
  createCompletion.mockResolvedValue({ choices: [{ message: { content: 'Ringkasan ESG.' } }] });
});

describe('POST /api/insight', () => {
  test('returns 401 when there is no session', async () => {
    mockUser(null);
    const res = await POST(makeRequest(validBody));
    expect(res.status).toBe(401);
  });

  test('returns 403 when the plan lacks AI insight access', async () => {
    mockUser({ id: 'user-insight-1' });
    vi.mocked(getSubscription).mockResolvedValue({ access: { canUseAiInsight: false } } as never);
    const res = await POST(makeRequest(validBody));
    expect(res.status).toBe(403);
  });

  test('returns 400 for an invalid body', async () => {
    mockUser({ id: 'user-insight-2' });
    const res = await POST(makeRequest({ period: '2026-Q1' }));
    expect(res.status).toBe(400);
  });

  test('returns the AI narrative on success', async () => {
    mockUser({ id: 'user-insight-3' });
    const res = await POST(makeRequest(validBody));
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.content).toBe('Ringkasan ESG.');
  });

  test('returns 429 after exceeding the per-minute rate limit', async () => {
    mockUser({ id: 'user-insight-rate-limited' });
    for (let i = 0; i < 5; i++) {
      const res = await POST(makeRequest(validBody));
      expect(res.status).toBe(200);
    }
    const limited = await POST(makeRequest(validBody));
    expect(limited.status).toBe(429);
  });

  test('returns 502 when Groq fails', async () => {
    mockUser({ id: 'user-insight-4' });
    createCompletion.mockRejectedValue(new Error('groq down'));
    const res = await POST(makeRequest(validBody));
    expect(res.status).toBe(502);
  });

  test('returns 400 when the elements array exceeds the framework size (payload-size guard)', async () => {
    mockUser({ id: 'user-insight-5' });
    const oversized = {
      ...validBody,
      results: {
        ...validBody.results,
        elements: Array.from({ length: 15 }, () => ({ elementId: 'E1', score: 70 })),
      },
    };
    const res = await POST(makeRequest(oversized));
    expect(res.status).toBe(400);
  });

  test('returns 429 once the per-IP limit is exceeded, even across distinct user accounts', async () => {
    const ip = '203.0.113.42';
    for (let i = 0; i < 20; i++) {
      mockUser({ id: `ip-limit-user-${i}` });
      const res = await POST(makeRequest(validBody, { 'x-forwarded-for': ip }));
      expect(res.status).toBe(200);
    }
    // A brand-new account (fresh per-user bucket) sharing the same source IP
    // as the 20 accounts above should still be blocked — this is the
    // defense-in-depth check against scripted multi-account signup abuse.
    mockUser({ id: 'ip-limit-user-fresh' });
    const limited = await POST(makeRequest(validBody, { 'x-forwarded-for': ip }));
    expect(limited.status).toBe(429);
  });
});
