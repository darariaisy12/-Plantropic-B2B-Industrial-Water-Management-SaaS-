'use client';

import type { ElementDefinition } from '@/lib/esg/types';
import type { FormState } from '@/lib/esg/form';

interface ElementCardProps {
  element: ElementDefinition;
  values: FormState;
  score: number;
  onChange: (indicatorId: string, value: string) => void;
}

const FIELD_STYLE: React.CSSProperties = {
  background: 'rgba(57,123,64,0.04)',
  border: '1.5px solid rgba(57,123,64,0.2)',
  color: '#1a2e1b',
  fontFamily: 'Plus Jakarta Sans, DM Sans, sans-serif',
};

/** One framework element: header (GRI anchor + live score) plus its inputs. */
export default function ElementCard({ element, values, score, onChange }: ElementCardProps) {
  return (
    <div
      className="rounded-2xl p-5 mb-4"
      style={{
        background: 'rgba(255,255,255,0.8)',
        border: '1px solid rgba(57,123,64,0.15)',
        boxShadow: '0 2px 12px rgba(57,123,64,0.06)',
      }}
    >
      <div className="flex items-start justify-between gap-3 mb-4">
        <div>
          <h3
            className="text-sm font-bold"
            style={{ color: '#1a2e1b', fontFamily: 'Plus Jakarta Sans, DM Sans, sans-serif' }}
          >
            {element.id} · {element.name}
          </h3>
          <p className="text-xs mt-0.5" style={{ color: '#9ca3af' }}>
            {element.griAnchor}
            {element.regulation ? ` · ${element.regulation}` : ''}
          </p>
        </div>
        <span
          className="shrink-0 text-xs font-bold px-2.5 py-1 rounded-lg"
          style={{ background: 'rgba(57,123,64,0.10)', color: '#397b40' }}
          title="Skor elemen (indikatif)"
        >
          {score.toFixed(0)}
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {element.indicators.map((indicator) => (
          <div key={indicator.id} className="flex flex-col gap-1.5">
            <label
              htmlFor={indicator.id}
              className="text-xs font-semibold"
              style={{ color: '#374151' }}
            >
              {indicator.label}
              {indicator.kind === 'quantitative' && (
                <span style={{ color: '#9ca3af' }}> ({indicator.unit})</span>
              )}
            </label>

            {indicator.kind === 'quantitative' ? (
              <input
                id={indicator.id}
                type="number"
                inputMode="decimal"
                min={0}
                step="any"
                value={values[indicator.id] ?? ''}
                onChange={(e) => onChange(indicator.id, e.target.value)}
                placeholder="0"
                className="w-full px-3 py-2.5 rounded-xl text-sm outline-none transition-all duration-200"
                style={FIELD_STYLE}
              />
            ) : (
              <select
                id={indicator.id}
                value={values[indicator.id] ?? ''}
                onChange={(e) => onChange(indicator.id, e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl text-sm outline-none transition-all duration-200"
                style={FIELD_STYLE}
              >
                <option value="">— pilih —</option>
                {indicator.options.map((option) => (
                  <option key={option.label} value={option.label}>
                    {option.label}
                  </option>
                ))}
              </select>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
