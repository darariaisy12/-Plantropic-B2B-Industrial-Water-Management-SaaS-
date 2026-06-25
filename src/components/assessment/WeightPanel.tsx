'use client';

import { ESG_FRAMEWORK } from '@/lib/esg/framework';
import { normalizeWeights } from '@/lib/esg/weights';
import type { ElementId, PillarId, Weights } from '@/lib/esg/types';

interface WeightPanelProps {
  weights: Weights;
  onPillarChange: (pillar: PillarId, value: number) => void;
  onElementChange: (elementId: ElementId, value: number) => void;
}

const PILLARS: { id: PillarId; label: string }[] = [
  { id: 'E', label: 'Environment' },
  { id: 'S', label: 'Social' },
  { id: 'G', label: 'Governance' },
];

const WEIGHT_MIN = 0;
const WEIGHT_MAX = 3;
const WEIGHT_STEP = 0.5;
const DEFAULT = 1;

function Slider({
  label,
  value,
  share,
  onChange,
}: {
  label: string;
  value: number;
  share: number;
  onChange: (value: number) => void;
}) {
  return (
    <div className="flex items-center gap-3 py-1.5">
      <span className="text-xs flex-1 min-w-0 truncate" style={{ color: '#374151' }}>
        {label}
      </span>
      <input
        type="range"
        min={WEIGHT_MIN}
        max={WEIGHT_MAX}
        step={WEIGHT_STEP}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-28 sm:w-40"
        style={{ accentColor: '#397b40' }}
      />
      <span className="text-xs font-semibold w-8 text-right" style={{ color: '#1a2e1b' }}>
        {value.toFixed(1)}
      </span>
      <span className="text-xs w-12 text-right" style={{ color: '#9ca3af' }}>
        {(share * 100).toFixed(0)}%
      </span>
    </div>
  );
}

/**
 * Weight configuration. Sliders set raw weights; the engine normalizes them
 * (pillars sum to 100%, elements sum to 100% within each pillar), and we show
 * the resulting share live so the user understands the effect.
 */
export default function WeightPanel({
  weights,
  onPillarChange,
  onElementChange,
}: WeightPanelProps) {
  const normalized = normalizeWeights(weights);

  return (
    <div>
      <section className="mb-6">
        <h3 className="text-sm font-bold mb-2" style={{ color: '#1a2e1b' }}>
          Bobot Pilar
        </h3>
        <p className="text-xs mb-3" style={{ color: '#9ca3af' }}>
          Atur seberapa besar tiap pilar memengaruhi skor ESG total.
        </p>
        {PILLARS.map(({ id, label }) => (
          <Slider
            key={id}
            label={label}
            value={weights.pillars[id] ?? DEFAULT}
            share={normalized.pillars[id]}
            onChange={(value) => onPillarChange(id, value)}
          />
        ))}
      </section>

      {PILLARS.map(({ id, label }) => (
        <section key={id} className="mb-5">
          <h4 className="text-xs font-bold mb-2 uppercase tracking-wide" style={{ color: '#397b40' }}>
            Bobot Elemen — {label}
          </h4>
          {ESG_FRAMEWORK.filter((element) => element.pillar === id).map((element) => (
            <Slider
              key={element.id}
              label={`${element.id} · ${element.name}`}
              value={weights.elements[element.id] ?? DEFAULT}
              share={normalized.elements[element.id]}
              onChange={(value) => onElementChange(element.id, value)}
            />
          ))}
        </section>
      ))}
    </div>
  );
}
