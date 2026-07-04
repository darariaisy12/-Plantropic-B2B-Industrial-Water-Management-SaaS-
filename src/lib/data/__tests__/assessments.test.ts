import { describe, expect, test, vi } from 'vitest';
import { createClient } from '@/lib/supabase/client';
import { createSupabaseChain, type SupabaseResult } from '@/test-utils/supabaseMock';
import { getAllAssessments, getCompany, getLatestAssessment, upsertCompany } from '../assessments';

vi.mock('@/lib/supabase/client', () => ({
  createClient: vi.fn(),
}));

function mockSupabase(options: { user?: { id: string } | null; fromResult: SupabaseResult }) {
  const user = options.user === undefined ? { id: 'user-1' } : options.user;
  const supabase = {
    auth: {
      getUser: vi.fn().mockResolvedValue({ data: { user }, error: user ? null : { message: 'no session' } }),
    },
    from: vi.fn(() => createSupabaseChain(options.fromResult)),
  };
  vi.mocked(createClient).mockReturnValue(supabase as never);
  return supabase;
}

describe('getCompany', () => {
  test('returns the company profile when found', async () => {
    mockSupabase({ fromResult: { data: { name: 'PT Sample', industry: 'Manufaktur', scale: 'Menengah' }, error: null } });
    expect(await getCompany()).toEqual({ name: 'PT Sample', industry: 'Manufaktur', scale: 'Menengah' });
  });

  test('returns null when no company row exists', async () => {
    mockSupabase({ fromResult: { data: null, error: null } });
    expect(await getCompany()).toBeNull();
  });

  test('throws a friendly error when the query fails', async () => {
    mockSupabase({ fromResult: { data: null, error: { message: 'db down' } } });
    await expect(getCompany()).rejects.toThrow('Gagal memuat profil perusahaan: db down');
  });
});

describe('getLatestAssessment', () => {
  test('returns the most recent assessment', async () => {
    const record = { id: 'a1', period: '2026-Q1', weights: {}, inputs: {}, results: null, created_at: '2026-01-01' };
    mockSupabase({ fromResult: { data: record, error: null } });
    expect(await getLatestAssessment()).toEqual(record);
  });

  test('returns null when no assessment exists', async () => {
    mockSupabase({ fromResult: { data: null, error: null } });
    expect(await getLatestAssessment()).toBeNull();
  });
});

describe('getAllAssessments', () => {
  test('returns all assessments oldest first', async () => {
    const records = [{ id: 'a1' }, { id: 'a2' }];
    mockSupabase({ fromResult: { data: records, error: null } });
    expect(await getAllAssessments()).toEqual(records);
  });

  test('returns an empty array when there is no data', async () => {
    mockSupabase({ fromResult: { data: null, error: null } });
    expect(await getAllAssessments()).toEqual([]);
  });

  test('throws a friendly error when the query fails', async () => {
    mockSupabase({ fromResult: { data: null, error: { message: 'timeout' } } });
    await expect(getAllAssessments()).rejects.toThrow('Gagal memuat riwayat assessment: timeout');
  });
});

describe('upsertCompany', () => {
  test('throws when there is no session', async () => {
    mockSupabase({ user: null, fromResult: { data: null, error: null } });
    await expect(upsertCompany({ name: 'PT X' })).rejects.toThrow('Sesi tidak ditemukan');
  });

  test('upserts the company profile for the signed-in user', async () => {
    const supabase = mockSupabase({ fromResult: { data: null, error: null } });
    await upsertCompany({ name: 'PT Y', industry: 'Energi', scale: 'Besar' });
    expect(supabase.from).toHaveBeenCalledWith('companies');
  });

  test('throws a friendly error when the upsert fails', async () => {
    mockSupabase({ fromResult: { data: null, error: { message: 'constraint violation' } } });
    await expect(upsertCompany({ name: 'PT Z' })).rejects.toThrow(
      'Gagal menyimpan profil perusahaan: constraint violation',
    );
  });
});
