/**
 * GHG emission breakdown (Scope 1 vs Scope 2, tCO2e), read from E1's
 * engine-computed `detail` so the dashboard never recomputes — it just
 * displays the auditable numbers the engine already produced.
 */

'use client';

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import type { ElementScore } from '@/lib/esg/types';

interface EmissionBreakdownProps {
  elements: readonly ElementScore[];
}

export default function EmissionBreakdown({ elements }: EmissionBreakdownProps) {
  const e1 = elements.find((e) => e.elementId === 'E1');
  const scope1 = e1?.detail?.scope1Tco2e ?? 0;
  const scope2 = e1?.detail?.scope2Tco2e ?? 0;
  const total = e1?.detail?.totalTco2e ?? scope1 + scope2;

  if (!e1?.detail) {
    return (
      <p className="text-sm" style={{ color: '#9ca3af' }}>
        Belum ada data emisi.
      </p>
    );
  }

  const data = [
    { scope: 'Scope 1\n(Bahan bakar)', tco2e: scope1 },
    { scope: 'Scope 2\n(Listrik)', tco2e: scope2 },
  ];

  return (
    <div>
      <p className="text-sm mb-2" style={{ color: '#374151' }}>
        Total emisi:{' '}
        <span className="font-bold" style={{ color: '#397b40' }}>
          {total.toFixed(2)} tCO2e
        </span>
      </p>
      <div style={{ width: '100%', height: 180 }}>
        <ResponsiveContainer>
          <BarChart data={data} layout="vertical" margin={{ top: 4, right: 16, bottom: 0, left: 8 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(57,123,64,0.10)" horizontal={false} />
            <XAxis
              type="number"
              tick={{ fill: '#6b7280', fontSize: 11, fontFamily: 'Plus Jakarta Sans, DM Sans, sans-serif' }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              type="category"
              dataKey="scope"
              width={110}
              tick={{ fill: '#374151', fontSize: 11, fontFamily: 'Plus Jakarta Sans, DM Sans, sans-serif' }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              formatter={(value: number) => [`${value.toFixed(3)} tCO2e`, 'Emisi']}
              contentStyle={{
                borderRadius: 12,
                border: '1px solid rgba(57,123,64,0.15)',
                fontFamily: 'Plus Jakarta Sans, DM Sans, sans-serif',
              }}
            />
            <Bar dataKey="tco2e" radius={[0, 8, 8, 0]} fill="#7B6F39" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
