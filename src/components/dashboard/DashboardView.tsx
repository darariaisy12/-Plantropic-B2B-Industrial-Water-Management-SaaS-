'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getLatestAssessment, type AssessmentRecord } from '@/lib/data/assessments';
import type { PillarId } from '@/lib/esg/types';
import ScoreRing from './ScoreRing';
import PillarBarChart from './PillarBarChart';
import ElementRadarChart from './ElementRadarChart';
import EmissionBreakdown from './EmissionBreakdown';
import AiInsightPanel from './AiInsightPanel';

const CARD_STYLE: React.CSSProperties = {
  background: 'rgba(255,255,255,0.85)',
  border: '1px solid rgba(57,123,64,0.12)',
  borderRadius: '20px',
  boxShadow: '0 2px 16px rgba(23,55,28,0.05)',
};

const PILLAR_LABEL: Record<PillarId, string> = {
  E: 'Environment',
  S: 'Social',
  G: 'Governance',
};

const PILLAR_COLOR: Record<PillarId, string> = {
  E: '#397b40',
  S: '#7B6F39',
  G: '#2d6233',
};

function SectionLabel({ children, accent }: { children: React.ReactNode; accent?: string }) {
  return (
    <div className="flex items-center gap-2 mb-3">
      <span
        className="inline-block w-1.5 h-4 rounded-full"
        style={{ background: accent ?? '#397b40' }}
      />
      <h2 className="text-sm font-bold" style={{ color: '#1a2e1b' }}>
        {children}
      </h2>
    </div>
  );
}

interface DashboardViewProps {
  displayName: string;
}

/**
 * Client-side dashboard: fetches the latest saved assessment and renders the
 * score ring, pillar bars, element radar, and emission breakdown from its
 * already-computed `results` — no recomputation happens here.
 */
export default function DashboardView({ displayName }: DashboardViewProps) {
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
      <div className="w-full max-w-5xl mx-auto px-4 py-16 text-center">
        <p className="text-sm" style={{ color: '#6b7280' }}>
          Memuat dashboard…
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full max-w-3xl mx-auto px-4 py-16 text-center">
        <p className="text-sm rounded-xl px-4 py-2.5 inline-block" style={{ background: 'rgba(220,38,38,0.08)', color: '#b91c1c' }}>
          {error}
        </p>
      </div>
    );
  }

  if (!assessment || !assessment.results) {
    return (
      <div className="w-full max-w-lg mx-auto px-4 py-16 text-center">
        <span className="text-4xl">🌱</span>
        <h1
          className="text-2xl font-bold mt-4"
          style={{ color: '#1a2e1b', fontFamily: 'Plus Jakarta Sans, DM Sans, sans-serif' }}
        >
          Halo, {displayName}!
        </h1>
        <p className="text-sm mt-2" style={{ color: '#6b7280' }}>
          Belum ada assessment tersimpan. Isi data operasional dulu untuk melihat skor ESG-mu.
        </p>
        <Link
          href="/assessment"
          className="inline-block mt-8 px-6 py-3 rounded-xl text-sm font-bold tracking-wide transition-all duration-300"
          style={{
            background: 'linear-gradient(135deg, #397b40 0%, #2d6233 100%)',
            color: '#ffffff',
            boxShadow: '0 4px 16px rgba(57,123,64,0.35)',
            fontFamily: 'Plus Jakarta Sans, DM Sans, sans-serif',
          }}
        >
          Mulai Assessment ESG
        </Link>
      </div>
    );
  }

  const { results, period } = assessment;
  const sector = typeof assessment.inputs?.['_sector'] === 'string'
    ? assessment.inputs['_sector']
    : undefined;

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-8 flex flex-col gap-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1
            className="text-2xl font-bold"
            style={{ color: '#1a2e1b', fontFamily: 'Plus Jakarta Sans, DM Sans, sans-serif' }}
          >
            Halo, {displayName.split(' ')[0]} 👋
          </h1>
          <p className="text-sm mt-1" style={{ color: '#6b7280' }}>
            Periode <span className="font-semibold" style={{ color: '#374151' }}>{period}</span> · skor indikatif, bukan rating audited.
          </p>
        </div>
        <div className="flex gap-2 shrink-0">
          <Link
            href="/report"
            className="px-4 py-2.5 rounded-xl text-xs font-bold tracking-wide transition-all duration-300"
            style={{
              background: 'linear-gradient(135deg, #397b40 0%, #2d6233 100%)',
              color: '#ffffff',
              fontFamily: 'Plus Jakarta Sans, DM Sans, sans-serif',
              boxShadow: '0 4px 14px rgba(57,123,64,0.3)',
            }}
          >
            Lihat Laporan
          </Link>
          <Link
            href="/assessment"
            className="px-4 py-2.5 rounded-xl text-xs font-bold tracking-wide transition-all duration-300"
            style={{
              background: 'rgba(57,123,64,0.08)',
              color: '#397b40',
              fontFamily: 'Plus Jakarta Sans, DM Sans, sans-serif',
            }}
          >
            Assessment Baru
          </Link>
        </div>
      </div>

      {/* Hero: overall score + pillar breakdown side by side */}
      <div className="p-6 flex flex-col sm:flex-row items-center gap-6" style={CARD_STYLE}>
        <div className="shrink-0">
          <ScoreRing score={results.overall} />
        </div>
        <div className="w-full sm:flex-1 flex flex-col gap-3">
          {results.pillars.map((p) => (
            <div key={p.pillar} className="flex items-center gap-3">
              <span className="text-xs font-semibold w-24 shrink-0" style={{ color: '#6b7280' }}>
                {PILLAR_LABEL[p.pillar]}
              </span>
              <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: 'rgba(0,0,0,0.06)' }}>
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${Math.min(100, Math.max(0, p.score))}%`,
                    background: PILLAR_COLOR[p.pillar],
                  }}
                />
              </div>
              <span className="text-xs font-bold w-10 text-right" style={{ color: PILLAR_COLOR[p.pillar] }}>
                {p.score.toFixed(0)}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Main grid: radar takes the wide column, bar + emission stack in the narrow column */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 p-5" style={CARD_STYLE}>
          <SectionLabel accent="#2d6233">Skor 14 Elemen</SectionLabel>
          <ElementRadarChart elements={results.elements} />
        </div>

        <div className="flex flex-col gap-6">
          <div className="p-5" style={CARD_STYLE}>
            <SectionLabel>Skor per Pilar</SectionLabel>
            <PillarBarChart pillars={results.pillars} />
          </div>

          <div className="p-5" style={CARD_STYLE}>
            <SectionLabel accent="#7B6F39">Emisi GRK (E1)</SectionLabel>
            <EmissionBreakdown elements={results.elements} sector={sector} />
          </div>
        </div>
      </div>

      <AiInsightPanel results={results} period={period} sector={sector} />
    </div>
  );
}
