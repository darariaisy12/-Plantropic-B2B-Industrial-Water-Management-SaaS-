/**
 * AI insight panel (Fase 6). Calls `/api/insight` with the already-computed
 * `EsgResult` — never computes scores itself, only renders Groq/Llama's
 * reading of numbers the engine already produced.
 */

'use client';

import type { EsgResult } from '@/lib/esg/types';
import { useInsight } from '@/lib/insight/useInsight';

interface AiInsightPanelProps {
  results: EsgResult;
  period: string;
  sector?: string;
}

export default function AiInsightPanel({ results, period, sector }: AiInsightPanelProps) {
  const { content, loading, error } = useInsight(results, period, sector);

  if (loading) {
    return (
      <div
        className="rounded-2xl p-5 flex items-start gap-3"
        style={{ background: 'rgba(123,111,57,0.06)', border: '1px dashed rgba(123,111,57,0.3)' }}
      >
        <span className="text-2xl">🤖</span>
        <p className="text-sm" style={{ color: '#6b7280' }}>
          Menganalisis hasil ESG-mu…
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className="rounded-2xl p-5 flex items-start gap-3"
        style={{ background: 'rgba(220,38,38,0.06)', border: '1px dashed rgba(220,38,38,0.25)' }}
      >
        <span className="text-2xl">⚠️</span>
        <p className="text-sm" style={{ color: '#b91c1c' }}>
          {error}
        </p>
      </div>
    );
  }

  return (
    <div
      className="rounded-2xl p-5"
      style={{ background: 'rgba(57,123,64,0.05)', border: '1px solid rgba(57,123,64,0.15)' }}
    >
      <div
        className="text-sm whitespace-pre-wrap leading-relaxed"
        style={{ color: '#374151' }}
      >
        {content}
      </div>
    </div>
  );
}
