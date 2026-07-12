/**
 * POST /api/assessment/save — persists an assessment, but recomputes the
 * ESG `results` server-side from the submitted `inputs`/`weights` instead of
 * trusting whatever the client claims. The engine (src/lib/esg/aggregate.ts)
 * is pure and deterministic, so recomputing here is cheap and closes the gap
 * where a tampered client could otherwise persist a fabricated score that
 * doesn't match its own submitted inputs — a score later trusted verbatim by
 * the admin dashboard, the PDF report, and /api/insight's pass/fail verdict.
 */

import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import { computeEsg } from '@/lib/esg/aggregate';
import { saveAssessment } from '@/lib/data/assessments';
import type { EsgInput, Weights } from '@/lib/esg/types';

const MAX_INPUT_KEYS = 200;
const MAX_TEXT_LEN = 500;

const inputsSchema = z
  .record(z.string().max(100), z.union([z.number(), z.string().max(MAX_TEXT_LEN)]))
  .refine((obj) => Object.keys(obj).length <= MAX_INPUT_KEYS, {
    message: `inputs may not have more than ${MAX_INPUT_KEYS} keys`,
  });

const weightsSchema = z.object({
  pillars: z.object({ E: z.number(), S: z.number(), G: z.number() }),
  // Element ids are validated loosely here (string keys, capped count) and
  // narrowed by `computeEsg` itself, which only ever reads known element
  // ids — an unrecognized key is simply ignored, never trusted as-is.
  elements: z.record(z.string().max(10), z.number()).optional().default({}),
});

const bodySchema = z.object({
  period: z.string().min(1).max(50),
  weights: weightsSchema,
  inputs: inputsSchema,
  company: z.object({
    name: z.string().min(1).max(200),
    industry: z.string().max(200).nullable().optional(),
    scale: z.string().max(200).nullable().optional(),
  }),
});

export async function POST(request: Request): Promise<NextResponse> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Sesi tidak ditemukan. Silakan login ulang.' }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Data assessment tidak valid.' }, { status: 400 });
  }

  const { period, weights, inputs, company } = parsed.data;
  const results = computeEsg(inputs as EsgInput, weights as Weights);

  try {
    const id = await saveAssessment(
      { period, weights: weights as Weights, inputs: inputs as EsgInput, results, company },
      supabase,
    );
    return NextResponse.json({ id });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Gagal menyimpan assessment.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
