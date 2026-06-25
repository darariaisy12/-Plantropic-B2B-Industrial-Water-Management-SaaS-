/**
 * Riwayat & Tren (Fase 8). Lists every saved assessment for the current user
 * and plots the overall ESG score trend across periods. Reads only stored
 * `results` — never recomputes.
 */

'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { getAllAssessments, type AssessmentRecord } from '@/lib/data/assessments';

const CARD_STYLE: React.CSSProperties = {
  background: 'rgba(255,255,255,0.8)',
  border: '1px solid rgba(57,123,64,0.15)',
  borderRadius: '20px',
  boxShadow: '0 4px 20px rgba(57,123,64,0.08)',
};

export default function HistoryView() {
  const [assessments, setAssessments] = useState<AssessmentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    getAllAssessments()
      .then((records) => {
        if (!cancelled) setAssessments(records);
      })
      .catch((err: unknown) => {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Gagal memuat riwayat.');
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
          Memuat riwayat…
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

  const withResults = assessments.filter((a) => a.results);
  const trendData = withResults.map((a) => ({ period: a.period, score: a.results!.overall }));

  return (
    <div className="w-full max-w-3xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between gap-4 mb-6">
        <h1
          className="text-2xl font-bold"
          style={{ color: '#1a2e1b', fontFamily: 'Plus Jakarta Sans, DM Sans, sans-serif' }}
        >
          Riwayat & Tren
        </h1>
        <Link
          href="/dashboard"
          className="text-xs font-semibold"
          style={{ color: '#397b40' }}
        >
          ← Dashboard
        </Link>
      </div>

      {withResults.length === 0 ? (
        <p className="text-sm text-center py-16" style={{ color: '#6b7280' }}>
          Belum ada riwayat assessment.
        </p>
      ) : (
        <>
          <div className="p-5 mb-5" style={CARD_STYLE}>
            <h2 className="text-sm font-semibold mb-2" style={{ color: '#374151' }}>
              Tren Skor ESG
            </h2>
            <div style={{ width: '100%', height: 220 }}>
              <ResponsiveContainer>
                <LineChart data={trendData} margin={{ top: 8, right: 16, bottom: 0, left: -16 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(57,123,64,0.10)" />
                  <XAxis
                    dataKey="period"
                    tick={{ fill: '#6b7280', fontSize: 11, fontFamily: 'Plus Jakarta Sans, DM Sans, sans-serif' }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    domain={[0, 100]}
                    tick={{ fill: '#6b7280', fontSize: 11, fontFamily: 'Plus Jakarta Sans, DM Sans, sans-serif' }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    formatter={(value: number) => [value.toFixed(1), 'Skor']}
                    contentStyle={{
                      borderRadius: 12,
                      border: '1px solid rgba(57,123,64,0.15)',
                      fontFamily: 'Plus Jakarta Sans, DM Sans, sans-serif',
                    }}
                  />
                  <Line type="monotone" dataKey="score" stroke="#397b40" strokeWidth={2} dot={{ r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="p-5" style={CARD_STYLE}>
            <h2 className="text-sm font-semibold mb-3" style={{ color: '#374151' }}>
              Daftar Assessment
            </h2>
            <table className="w-full text-sm">
              <tbody>
                {[...withResults].reverse().map((a) => (
                  <tr key={a.id} style={{ borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
                    <td className="py-2 pr-2" style={{ color: '#374151' }}>
                      {a.period}
                    </td>
                    <td className="py-2 pr-2 text-xs" style={{ color: '#9ca3af' }}>
                      {new Date(a.created_at).toLocaleDateString('id-ID')}
                    </td>
                    <td className="py-2 text-right font-bold" style={{ color: '#397b40' }}>
                      {a.results!.overall.toFixed(1)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
