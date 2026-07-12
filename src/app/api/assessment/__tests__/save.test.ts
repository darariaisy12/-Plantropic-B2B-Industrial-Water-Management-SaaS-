import { describe, expect, test, vi, beforeEach } from 'vitest';
import { createClient } from '@/lib/supabase/server';
import { saveAssessment } from '@/lib/data/assessments';
import { computeEsg } from '@/lib/esg/aggregate';
import { defaultWeights } from '@/lib/esg/form';
import { POST } from '../save/route';

vi.mock('@/lib/supabase/server', () => ({ createClient: vi.fn() }));
vi.mock('@/lib/data/assessments', () => ({ saveAssessment: vi.fn() }));

function makeRequest(body: unknown): Request {
  return new Request('http://localhost/api/assessment/save', { method: 'POST', body: JSON.stringify(body) });
}

function mockUser(user: { id: string } | null) {
  vi.mocked(createClient).mockResolvedValue({
    auth: { getUser: vi.fn().mockResolvedValue({ data: { user } }) },
  } as never);
}

const validBody = {
  period: '2026-Q1',
  weights: defaultWeights(),
  inputs: { no_child_labor: 'Ya', freedom_of_association: 'Ya', min_wage_compliance: 'Ya' },
  company: { name: 'PT Sample' },
};

beforeEach(() => {
  vi.mocked(saveAssessment).mockResolvedValue('assessment-1');
});

describe('POST /api/assessment/save', () => {
  test('returns 401 when there is no session', async () => {
    mockUser(null);
    const res = await POST(makeRequest(validBody));
    expect(res.status).toBe(401);
  });

  test('returns 400 for an invalid body', async () => {
    mockUser({ id: 'user-1' });
    const res = await POST(makeRequest({ period: '' }));
    expect(res.status).toBe(400);
  });

  test('recomputes results server-side and ignores any client-supplied results', async () => {
    mockUser({ id: 'user-1' });
    const fakeResults = { overall: 999, pillars: [], elements: [] };

    const res = await POST(makeRequest({ ...validBody, results: fakeResults }));

    expect(res.status).toBe(200);
    expect(saveAssessment).toHaveBeenCalledTimes(1);
    const [args] = vi.mocked(saveAssessment).mock.calls[0];
    const expected = computeEsg(validBody.inputs as never, validBody.weights);
    expect(args.results).toEqual(expected);
    expect(args.results.overall).not.toBe(999);
  });

  test('returns 500 when the save fails', async () => {
    mockUser({ id: 'user-1' });
    vi.mocked(saveAssessment).mockRejectedValue(new Error('db down'));
    const res = await POST(makeRequest(validBody));
    expect(res.status).toBe(500);
  });
});
