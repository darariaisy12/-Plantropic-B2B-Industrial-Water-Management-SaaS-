/**
 * Radar chart over all 14 ESG elements. Axis labels use the element id (E1,
 * S3, ...) to stay legible with 14 spokes; the full name shows in the tooltip.
 */

'use client';

import {
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';
import { ESG_FRAMEWORK } from '@/lib/esg/framework';
import type { ElementScore } from '@/lib/esg/types';

interface ElementRadarChartProps {
  elements: readonly ElementScore[];
}

export default function ElementRadarChart({ elements }: ElementRadarChartProps) {
  const nameById = new Map(ESG_FRAMEWORK.map((e) => [e.id, e.name]));
  const data = elements.map((e) => ({
    element: e.elementId,
    name: nameById.get(e.elementId) ?? e.elementId,
    score: e.score,
  }));

  return (
    <div style={{ width: '100%', height: 320 }}>
      <ResponsiveContainer>
        <RadarChart data={data}>
          <PolarGrid stroke="rgba(57,123,64,0.15)" />
          <PolarAngleAxis
            dataKey="element"
            tick={{ fill: '#374151', fontSize: 11, fontFamily: 'Plus Jakarta Sans, DM Sans, sans-serif' }}
          />
          <PolarRadiusAxis domain={[0, 100]} tick={{ fontSize: 10, fill: '#9ca3af' }} />
          <Radar dataKey="score" stroke="#397b40" fill="#397b40" fillOpacity={0.35} />
          <Tooltip
            formatter={(value: number, _name, item) => [`${value.toFixed(1)}`, item.payload.name]}
            contentStyle={{
              borderRadius: 12,
              border: '1px solid rgba(57,123,64,0.15)',
              fontFamily: 'Plus Jakarta Sans, DM Sans, sans-serif',
            }}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}
