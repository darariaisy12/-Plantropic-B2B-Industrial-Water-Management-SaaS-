/**
 * GRI-style sustainability report (Fase 7). Reads the latest saved
 * assessment and renders a print-friendly document: AI executive summary,
 * score & methodology, E/S/G detail per element, and GRI references.
 * Never recomputes scores — only displays the engine's stored `results`.
 */

'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getLatestAssessment, type AssessmentRecord } from '@/lib/data/assessments';
import { ESG_FRAMEWORK } from '@/lib/esg/framework';
import type { ElementScore, EsgResult, PillarId } from '@/lib/esg/types';
import { useInsight } from '@/lib/insight/useInsight';
import UpgradePrompt from '@/components/subscription/UpgradePrompt';

const PILLAR_LABEL: Record<PillarId, string> = {
  E: 'Environment',
  S: 'Social',
  G: 'Governance',
};

const SECTION_TITLE: React.CSSProperties = {
  color: '#1a2e1b',
  fontFamily: 'Plus Jakarta Sans, DM Sans, sans-serif',
};

function elementsByPillar(elements: readonly ElementScore[], pillar: PillarId) {
  return ESG_FRAMEWORK.filter((def) => def.pillar === pillar).map((def) => ({
    def,
    score: elements.find((e) => e.elementId === def.id)?.score ?? 0,
  }));
}

interface ReportContentProps {
  assessment: AssessmentRecord;
  results: EsgResult;
  canUseAiInsight: boolean;
}

function ReportContent({ assessment, results, canUseAiInsight }: ReportContentProps) {
  const { period } = assessment;
  const sector = typeof assessment.inputs?.['_sector'] === 'string'
    ? assessment.inputs['_sector']
    : undefined;
  const { content, loading, error } = useInsight(results, period, sector);

  return (
    <div className="w-full max-w-3xl mx-auto px-4 py-8 print:px-0 print:py-0">
      <div className="flex items-center justify-between gap-4 mb-8 print:hidden">
        <Link
          href="/dashboard"
          className="text-xs font-semibold"
          style={{ color: '#397b40' }}
        >
          ← Kembali ke dashboard
        </Link>
        <button
          type="button"
          onClick={() => window.print()}
          className="px-4 py-2 rounded-xl text-xs font-bold tracking-wide transition-all duration-300"
          style={{
            background: 'linear-gradient(135deg, #397b40 0%, #2d6233 100%)',
            color: '#ffffff',
          }}
        >
          Unduh PDF
        </button>
      </div>

      <header className="mb-8">
        <h1 className="text-2xl font-bold" style={SECTION_TITLE}>
          Laporan Keberlanjutan ESG
        </h1>
        <p className="text-sm mt-1" style={{ color: '#6b7280' }}>
          Periode {period} · disusun berdasarkan 14 elemen ESG mengacu GRI Standards. Skor
          indikatif, bukan rating audited.
        </p>
      </header>

      <section className="mb-8">
        <h2 className="text-base font-bold mb-2" style={SECTION_TITLE}>
          1. Ringkasan Eksekutif & Rekomendasi (AI)
        </h2>
        {!canUseAiInsight ? (
          <UpgradePrompt feature="AI Insight & Ringkasan Eksekutif" />
        ) : (
          <>
            {loading && (
              <p className="text-sm" style={{ color: '#6b7280' }}>
                Menyusun ringkasan…
              </p>
            )}
            {error && (
              <p className="text-sm" style={{ color: '#b91c1c' }}>
                {error}
              </p>
            )}
            {content && (
              <p className="text-sm whitespace-pre-wrap leading-relaxed" style={{ color: '#374151' }}>
                {content}
              </p>
            )}
          </>
        )}
      </section>

      <section className="mb-8">
        <h2 className="text-base font-bold mb-2" style={SECTION_TITLE}>
          2. Skor & Metodologi
        </h2>
        <p className="text-sm mb-3" style={{ color: '#374151' }}>
          Skor keseluruhan: <span className="font-bold">{results.overall.toFixed(1)}/100</span>.
          Dihitung secara deterministik dari 14 elemen ESG (rumus kuantitatif + maturitas
          kualitatif), diagregasi per pilar lalu ke skor total menggunakan bobot yang dipilih
          perusahaan.
        </p>
        <div className="grid grid-cols-3 gap-3">
          {results.pillars.map((p) => (
            <div
              key={p.pillar}
              className="rounded-xl p-3 text-center"
              style={{ background: 'rgba(57,123,64,0.06)' }}
            >
              <p className="text-xs" style={{ color: '#6b7280' }}>
                {PILLAR_LABEL[p.pillar]}
              </p>
              <p className="text-lg font-bold" style={{ color: '#397b40' }}>
                {p.score.toFixed(1)}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-base font-bold mb-2" style={SECTION_TITLE}>
          3. Detail E/S/G
        </h2>
        {(['E', 'S', 'G'] as const).map((pillar) => (
          <div key={pillar} className="mb-4">
            <h3 className="text-sm font-bold mb-1" style={{ color: '#374151' }}>
              {PILLAR_LABEL[pillar]}
            </h3>
            <table className="w-full text-sm">
              <tbody>
                {elementsByPillar(results.elements, pillar).map(({ def, score }) => (
                  <tr key={def.id} style={{ borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
                    <td className="py-1.5 pr-2" style={{ color: '#6b7280', width: '2.5rem' }}>
                      {def.id}
                    </td>
                    <td className="py-1.5 pr-2" style={{ color: '#374151' }}>
                      {def.name}
                    </td>
                    <td className="py-1.5 text-right font-semibold" style={{ color: '#397b40' }}>
                      {score.toFixed(1)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))}
      </section>

      <section>
        <h2 className="text-base font-bold mb-2" style={SECTION_TITLE}>
          4. Referensi GRI & Regulasi
        </h2>
        <table className="w-full text-sm">
          <tbody>
            {ESG_FRAMEWORK.map((def) => (
              <tr key={def.id} style={{ borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
                <td className="py-1.5 pr-2" style={{ color: '#6b7280', width: '2.5rem' }}>
                  {def.id}
                </td>
                <td className="py-1.5 pr-2" style={{ color: '#374151' }}>
                  {def.name}
                </td>
                <td className="py-1.5 text-right" style={{ color: '#6b7280' }}>
                  {def.griAnchor}
                  {def.regulation ? ` · ${def.regulation}` : ''}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}

interface ReportViewProps {
  displayName: string;
  canUseAiInsight: boolean;
}

export default function ReportView({ displayName, canUseAiInsight }: ReportViewProps) {
  const [assessment, setAssessment] = useState<AssessmentRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    getLatestAssessment()
      .then((record) => {
        if (!cancelled) setAssessment(record);
      })
      .catch((err: unknown) => {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Gagal memuat data.');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <div className="w-full max-w-3xl mx-auto px-4 py-16 text-center">
        <p className="text-sm" style={{ color: '#6b7280' }}>
          Memuat laporan…
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full max-w-3xl mx-auto px-4 py-16 text-center">
        <p
          className="text-sm rounded-xl px-4 py-2.5 inline-block"
          style={{ background: 'rgba(220,38,38,0.08)', color: '#b91c1c' }}
        >
          {error}
        </p>
      </div>
    );
  }

  if (!assessment || !assessment.results) {
    return (
      <div className="w-full max-w-lg mx-auto px-4 py-16 text-center">
        <span className="text-4xl">📄</span>
        <h1 className="text-2xl font-bold mt-4" style={SECTION_TITLE}>
          Halo, {displayName}!
        </h1>
        <p className="text-sm mt-2" style={{ color: '#6b7280' }}>
          Belum ada assessment tersimpan. Isi data operasional dulu untuk membuat laporan ESG-mu.
        </p>
        <Link
          href="/assessment"
          className="inline-block mt-8 px-6 py-3 rounded-xl text-sm font-bold tracking-wide transition-all duration-300"
          style={{
            background: 'linear-gradient(135deg, #397b40 0%, #2d6233 100%)',
            color: '#ffffff',
          }}
        >
          Mulai Assessment ESG
        </Link>
      </div>
    );
  }

  return (
    <ReportContent
      assessment={assessment}
      results={assessment.results}
      canUseAiInsight={canUseAiInsight}
    />
  );
}
