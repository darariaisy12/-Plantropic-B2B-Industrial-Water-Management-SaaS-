/**
 * Riwayat & Tren (Fase 8). Lists every saved assessment for the current user
 * and plots the overall ESG score trend across periods. Reads only stored
 * `results` — never recomputes.
 */

'use client';

import { useState } from 'react';
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
import type { AssessmentRecord } from '@/lib/data/assessments';

const CARD_STYLE: React.CSSProperties = {
  background: 'rgba(255,255,255,0.8)',
  border: '1px solid rgba(57,123,64,0.15)',
  borderRadius: '20px',
  boxShadow: '0 4px 20px rgba(57,123,64,0.08)',
};

const PILLAR_LABEL: Record<string, string> = { E: 'Environment', S: 'Social', G: 'Governance' };
const PILLAR_COLOR: Record<string, string> = { E: '#397b40', S: '#7B6F39', G: '#2d6233' };

interface HistoryViewProps {
  assessments: AssessmentRecord[];
}

export default function HistoryView({ assessments }: HistoryViewProps) {
  const [expanded, setExpanded] = useState<string | null>(null);

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
                {[...withResults].reverse().map((a) => {
                  const res = a.results!;
                  const isOpen = expanded === a.id;
                  return (
                    <>
                      <tr
                        key={a.id}
                        onClick={() => setExpanded(isOpen ? null : a.id)}
                        className="cursor-pointer hover:bg-[rgba(57,123,64,0.04)] transition-colors"
                        style={{ borderBottom: isOpen ? 'none' : '1px solid rgba(0,0,0,0.06)' }}
                      >
                        <td className="py-2.5 pr-2 font-medium" style={{ color: '#374151' }}>
                          {a.period}
                        </td>
                        <td className="py-2.5 pr-2 text-xs" style={{ color: '#9ca3af' }}>
                          {new Date(a.created_at).toLocaleDateString('id-ID')}
                        </td>
                        <td className="py-2.5 text-right font-bold" style={{ color: '#397b40' }}>
                          {res.overall.toFixed(1)}
                        </td>
                        <td className="py-2.5 pl-3 text-right text-xs" style={{ color: '#9ca3af' }}>
                          {isOpen ? '▲' : '▼'}
                        </td>
                      </tr>
                      {isOpen && (
                        <tr key={`${a.id}-detail`} style={{ borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
                          <td colSpan={4} className="pb-4 pt-1 px-1">
                            <div className="flex flex-col gap-2">
                              {res.pillars.map((p) => (
                                <div key={p.pillar} className="flex items-center gap-2">
                                  <span className="text-xs w-24 shrink-0" style={{ color: '#6b7280' }}>
                                    {PILLAR_LABEL[p.pillar]}
                                  </span>
                                  <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(0,0,0,0.06)' }}>
                                    <div
                                      className="h-full rounded-full"
                                      style={{ width: `${p.score}%`, background: PILLAR_COLOR[p.pillar] }}
                                    />
                                  </div>
                                  <span className="text-xs font-semibold w-8 text-right" style={{ color: PILLAR_COLOR[p.pillar] }}>
                                    {p.score.toFixed(0)}
                                  </span>
                                </div>
                              ))}
                              <div className="grid grid-cols-2 gap-x-4 gap-y-1 mt-1">
                                {res.elements.map((e) => (
                                  <div key={e.elementId} className="flex items-center justify-between">
                                    <span className="text-xs" style={{ color: '#9ca3af' }}>{e.elementId}</span>
                                    <span className="text-xs font-semibold" style={{ color: e.score >= 70 ? '#397b40' : e.score >= 40 ? '#d97706' : '#b91c1c' }}>
                                      {e.score.toFixed(0)}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
