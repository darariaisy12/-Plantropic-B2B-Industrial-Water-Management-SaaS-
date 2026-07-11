/**
 * Client-side data access for assessments and the single company row.
 * Every write sets user_id from the current session so the Supabase RLS
 * policies (auth.uid() = user_id) accept it. The engine result is stored
 * alongside the raw inputs/weights so the dashboard can render without
 * recomputing — and so we keep an auditable snapshot per period.
 */

import type { SupabaseClient } from '@supabase/supabase-js';
import { createClient } from '@/lib/supabase/client';
import type { EsgInput, EsgResult, Weights } from '@/lib/esg/types';

export interface CompanyProfile {
  name: string;
  industry?: string | null;
  scale?: string | null;
}

export interface AssessmentRecord {
  id: string;
  period: string;
  weights: Weights;
  inputs: EsgInput;
  results: EsgResult | null;
  created_at: string;
}

export interface SaveAssessmentArgs {
  period: string;
  weights: Weights;
  inputs: EsgInput;
  results: EsgResult;
  company: CompanyProfile;
}

/** Resolve the signed-in user's id or throw — every write needs it for RLS. */
async function requireUserId(): Promise<string> {
  const supabase = createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  if (error || !user) {
    throw new Error('Sesi tidak ditemukan. Silakan login ulang.');
  }
  return user.id;
}

/**
 * Insert or update the user's company row. One account = one company, so we
 * upsert on the unique user_id rather than creating duplicates per save.
 */
export async function upsertCompany(profile: CompanyProfile): Promise<void> {
  const supabase = createClient();
  const userId = await requireUserId();

  const { error } = await supabase.from('companies').upsert(
    {
      user_id: userId,
      name: profile.name,
      industry: profile.industry ?? null,
      scale: profile.scale ?? null,
    },
    { onConflict: 'user_id' },
  );

  if (error) {
    throw new Error(`Gagal menyimpan profil perusahaan: ${error.message}`);
  }
}

/**
 * Persist one assessment for a period. If an assessment already exists for the
 * same user + period, it is updated in place (no duplicate rows per period).
 */
export async function saveAssessment(args: SaveAssessmentArgs): Promise<string> {
  const supabase = createClient();
  const userId = await requireUserId();

  await upsertCompany(args.company);

  const { data: existing } = await supabase
    .from('assessments')
    .select('id')
    .eq('user_id', userId)
    .eq('period', args.period)
    .maybeSingle();

  if (existing) {
    const { error } = await supabase
      .from('assessments')
      .update({ weights: args.weights, inputs: args.inputs, results: args.results })
      .eq('id', existing.id);
    if (error) throw new Error(`Gagal memperbarui assessment: ${error.message}`);
    return existing.id as string;
  }

  const { data, error } = await supabase
    .from('assessments')
    .insert({
      user_id: userId,
      period: args.period,
      weights: args.weights,
      inputs: args.inputs,
      results: args.results,
    })
    .select('id')
    .single();

  if (error || !data) {
    throw new Error(`Gagal menyimpan assessment: ${error?.message ?? 'unknown error'}`);
  }

  return data.id as string;
}

/**
 * Fetch the most recent assessment for the current user, if any. Pass a
 * server-side client (Server Components already hold one) to avoid a
 * client-side round trip on first render; omit it to use the browser client.
 */
export async function getLatestAssessment(client?: SupabaseClient): Promise<AssessmentRecord | null> {
  const supabase = client ?? createClient();

  const { data, error } = await supabase
    .from('assessments')
    .select('id, period, weights, inputs, results, created_at')
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    throw new Error(`Gagal memuat assessment: ${error.message}`);
  }

  return (data as AssessmentRecord | null) ?? null;
}

/**
 * Fetch all assessments for the current user, oldest first (for trend
 * views). Pass a server-side client to fetch during the initial server
 * render instead of a client-side round trip; omit it for the browser client.
 */
export async function getAllAssessments(client?: SupabaseClient): Promise<AssessmentRecord[]> {
  const supabase = client ?? createClient();

  const { data, error } = await supabase
    .from('assessments')
    .select('id, period, weights, inputs, results, created_at')
    .order('created_at', { ascending: true });

  if (error) {
    throw new Error(`Gagal memuat riwayat assessment: ${error.message}`);
  }

  return (data as AssessmentRecord[]) ?? [];
}

/** Fetch the current user's company profile, if saved. */
export async function getCompany(): Promise<CompanyProfile | null> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('companies')
    .select('name, industry, scale')
    .maybeSingle();

  if (error) {
    throw new Error(`Gagal memuat profil perusahaan: ${error.message}`);
  }

  return (data as CompanyProfile | null) ?? null;
}
