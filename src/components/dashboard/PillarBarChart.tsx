/**
 * Bar chart comparing the three pillar scores (Environment / Social /
 * Governance). Pillars always arrive in E, S, G order from `aggregate()`.
 */

'use client';

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import type { PillarId, PillarScore } from '@/lib/esg/types';

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

interface PillarBarChartProps {
  pillars: readonly PillarScore[];
}

export default function PillarBarChart({ pillars }: PillarBarChartProps) {
  const data = pillars.map((p) => ({
    pillar: PILLAR_LABEL[p.pillar],
    score: p.score,
    fill: PILLAR_COLOR[p.pillar],
  }));

  return (
    <div style={{ width: '100%', height: 220 }}>
      <ResponsiveContainer>
        <BarChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: -16 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(57,123,64,0.10)" vertical={false} />
          <XAxis
            dataKey="pillar"
            tick={{ fill: '#6b7280', fontSize: 12, fontFamily: 'Plus Jakarta Sans, DM Sans, sans-serif' }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            domain={[0, 100]}
            tick={{ fill: '#6b7280', fontSize: 12, fontFamily: 'Plus Jakarta Sans, DM Sans, sans-serif' }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            formatter={(value: number) => [`${value.toFixed(1)}`, 'Skor']}
            contentStyle={{
              borderRadius: 12,
              border: '1px solid rgba(57,123,64,0.15)',
              fontFamily: 'Plus Jakarta Sans, DM Sans, sans-serif',
            }}
          />
          <Bar dataKey="score" radius={[8, 8, 0, 0]} fill="#397b40" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
