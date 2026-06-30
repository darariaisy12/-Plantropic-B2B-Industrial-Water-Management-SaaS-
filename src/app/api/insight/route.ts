/**
 * POST /api/insight — server-only Route Handler. Reads the already-computed
 * `EsgResult` sent by the dashboard, asks Groq (Llama 3.3) to interpret it,
 * and returns the narrative. Never recomputes scores; auth-gated by
 * Supabase session.
 */

import { NextResponse } from 'next/server';
import Groq from 'groq-sdk';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import { buildInsightPrompt } from '@/lib/insight/prompt';
import { getSubscription } from '@/lib/subscription/getSubscription';
import type { ElementId } from '@/lib/esg/types';

const RATE_LIMIT_MAX = 5;
const RATE_LIMIT_WINDOW_MS = 60_000;
const rateLimit = new Map<string, { count: number; resetAt: number }>();

function isRateLimited(userId: string): boolean {
  const now = Date.now();
  const entry = rateLimit.get(userId);
  if (!entry || now > entry.resetAt) {
    rateLimit.set(userId, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return false;
  }
  if (entry.count >= RATE_LIMIT_MAX) return true;
  entry.count++;
  return false;
}

const ELEMENT_IDS = [
  'E1', 'E2', 'E3', 'E4', 'E5',
  'S1', 'S2', 'S3', 'S4', 'S5',
  'G1', 'G2', 'G3', 'G4',
] as const satisfies readonly ElementId[];

const elementScoreSchema = z.object({
  elementId: z.enum(ELEMENT_IDS),
  score: z.number(),
  detail: z.record(z.string(), z.number()).optional(),
});

const requestSchema = z.object({
  period: z.string().min(1),
  results: z.object({
    overall: z.number(),
    pillars: z.array(z.object({ pillar: z.enum(['E', 'S', 'G']), score: z.number() })),
    elements: z.array(elementScoreSchema),
  }),
  sector: z.string().optional(),
});

export async function POST(request: Request): Promise<NextResponse> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Sesi tidak ditemukan. Silakan login ulang.' }, { status: 401 });
  }

  const { access } = await getSubscription();
  if (!access.canUseAiInsight) {
    return NextResponse.json(
      { error: 'Fitur AI Insight tersedia di plan Professional ke atas.' },
      { status: 403 },
    );
  }

  if (isRateLimited(user.id)) {
    return NextResponse.json(
      { error: 'Terlalu banyak permintaan. Coba lagi dalam 1 menit.' },
      { status: 429 },
    );
  }

  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: 'Layanan AI belum dikonfigurasi.' }, { status: 503 });
  }

  const body = await request.json().catch(() => null);
  const parsed = requestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Data assessment tidak valid.' }, { status: 400 });
  }

  const prompt = buildInsightPrompt(parsed.data.results, parsed.data.period, parsed.data.sector);

  try {
    const groq = new Groq({ apiKey });
    const response = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [{ role: 'user', content: prompt }],
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      return NextResponse.json({ error: 'AI tidak mengembalikan jawaban.' }, { status: 502 });
    }

    return NextResponse.json({ content });
  } catch {
    return NextResponse.json({ error: 'Gagal menghubungi layanan AI.' }, { status: 502 });
  }
}
