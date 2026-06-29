/**
 * Client hook for fetching the AI insight narrative from `/api/insight`.
 * Shared by the dashboard panel and the report page so the same assessment
 * never triggers two separate Groq calls for the same render.
 */

'use client';

import { useEffect, useState } from 'react';
import type { EsgResult } from '@/lib/esg/types';

interface UseInsightResult {
  content: string | null;
  loading: boolean;
  error: string | null;
}

export function useInsight(
  results: EsgResult,
  period: string,
  sector?: string,
): UseInsightResult {
  const [content, setContent] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    async function loadInsight(): Promise<void> {
      try {
        const res = await fetch('/api/insight', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ period, results, sector }),
        });
        const data = (await res.json()) as { content?: string; error?: string };
        if (cancelled) return;
        if (!res.ok || !data.content) {
          setError(data.error ?? 'Gagal memuat insight AI.');
          return;
        }
        setContent(data.content);
      } catch {
        if (!cancelled) setError('Gagal menghubungi layanan AI.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void loadInsight();
    return () => {
      cancelled = true;
    };
  }, [results, period, sector]);

  return { content, loading, error };
}
