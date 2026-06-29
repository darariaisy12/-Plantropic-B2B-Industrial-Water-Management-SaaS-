/**
 * Builds the prompt sent to Groq (Llama 3.3 70B) from an already-computed
 * `EsgResult`. Pure function — never touches the engine, AI, or DB. The AI
 * only interprets numbers the engine already produced; it never recomputes them.
 */

import { ESG_FRAMEWORK } from '@/lib/esg/framework';
import { SECTOR_INTENSITY_BENCHMARKS } from '@/lib/esg/emissionFactors';
import type { EsgResult } from '@/lib/esg/types';

const PILLAR_LABEL: Record<'E' | 'S' | 'G', string> = {
  E: 'Environment',
  S: 'Social',
  G: 'Governance',
};

function elementName(elementId: string): string {
  return ESG_FRAMEWORK.find((e) => e.id === elementId)?.name ?? elementId;
}

function sectorLine(sector: string | undefined): string {
  if (!sector) return '';
  const label = SECTOR_INTENSITY_BENCHMARKS[sector]?.label ?? sector;
  return ` Perusahaan bergerak di sektor: **${label}**.`;
}

export function buildInsightPrompt(
  results: EsgResult,
  period: string,
  sector?: string,
): string {
  const pillarLines = results.pillars
    .map((p) => `- ${PILLAR_LABEL[p.pillar]}: ${p.score.toFixed(1)}/100`)
    .join('\n');

  const elementLines = results.elements
    .map((e) => `- ${e.elementId} ${elementName(e.elementId)}: ${e.score.toFixed(1)}/100`)
    .join('\n');

  return `Kamu adalah konsultan ESG senior yang membaca hasil skor ESG sebuah perusahaan untuk periode ${period}.${sectorLine(sector)} Skor di bawah ini sudah dihitung secara deterministik oleh sistem — JANGAN menghitung ulang atau mengubah angka, cukup interpretasikan.

Skor keseluruhan: ${results.overall.toFixed(1)}/100

Skor per pilar:
${pillarLines}

Skor 14 elemen:
${elementLines}

Tugasmu, tulis dalam Bahasa Indonesia, singkat dan actionable:
1. Ringkasan eksekutif (2-3 kalimat)
2. 3 kekuatan utama (elemen dengan skor tertinggi)
3. 3 rekomendasi prioritas (elemen dengan skor terendah, paling berdampak)
4. Catatan benchmark singkat — jika sektor diketahui, beri konteks spesifik sektor tersebut; tandai jelas sebagai estimasi karena bukan dari database benchmark yang teraudit.

Akhiri dengan disclaimer satu kalimat bahwa ini adalah insight indikatif berbasis AI, bukan audit resmi.`;
}
