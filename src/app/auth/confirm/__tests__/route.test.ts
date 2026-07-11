import { describe, expect, test, vi } from 'vitest';
import type { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { GET } from '../route';

vi.mock('@/lib/supabase/server', () => ({ createClient: vi.fn() }));

function makeRequest(query: string): NextRequest {
  return new Request(`http://localhost/auth/confirm${query}`) as unknown as NextRequest;
}

function mockVerifyOtp(error: { message: string } | null) {
  vi.mocked(createClient).mockResolvedValue({
    auth: { verifyOtp: vi.fn().mockResolvedValue({ error }) },
  } as never);
}

describe('GET /auth/confirm', () => {
  test('redirects to the default dashboard path on successful verification with no next param', async () => {
    mockVerifyOtp(null);
    const res = await GET(makeRequest('?token_hash=abc&type=signup'));
    expect(res.status).toBe(307);
    expect(new URL(res.headers.get('location')!).pathname).toBe('/dashboard');
  });

  test('redirects to a same-origin relative next path on success', async () => {
    mockVerifyOtp(null);
    const res = await GET(makeRequest('?token_hash=abc&type=signup&next=/settings'));
    expect(new URL(res.headers.get('location')!).pathname).toBe('/settings');
  });

  test('rejects an absolute-URL next param and falls back to the default path (open-redirect guard)', async () => {
    mockVerifyOtp(null);
    const res = await GET(makeRequest('?token_hash=abc&type=signup&next=https://evil.example.com'));
    const location = new URL(res.headers.get('location')!);
    expect(location.hostname).toBe('localhost');
    expect(location.pathname).toBe('/dashboard');
  });

  test('rejects a protocol-relative next param (open-redirect guard)', async () => {
    mockVerifyOtp(null);
    const res = await GET(makeRequest('?token_hash=abc&type=signup&next=//evil.example.com'));
    const location = new URL(res.headers.get('location')!);
    expect(location.hostname).toBe('localhost');
    expect(location.pathname).toBe('/dashboard');
  });

  test('redirects to /login on OTP verification failure regardless of next param', async () => {
    mockVerifyOtp({ message: 'expired token' });
    const res = await GET(makeRequest('?token_hash=abc&type=signup&next=https://evil.example.com'));
    const location = new URL(res.headers.get('location')!);
    expect(location.pathname).toBe('/login');
    expect(location.searchParams.get('error')).toBe('confirm');
  });

  test('redirects to /login when token_hash or type is missing', async () => {
    const res = await GET(makeRequest(''));
    expect(new URL(res.headers.get('location')!).pathname).toBe('/login');
  });
});
