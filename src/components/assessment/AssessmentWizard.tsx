'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ESG_FRAMEWORK } from '@/lib/esg/framework';
import { computeEsg } from '@/lib/esg/aggregate';
import { emptyFormState, toEsgInput, defaultWeights, findIncompleteElements, type FormState } from '@/lib/esg/form';
import { saveAssessment } from '@/lib/data/assessments';
import type { ElementId, PillarId, Weights } from '@/lib/esg/types';
import ElementCard from './ElementCard';
import WeightPanel from './WeightPanel';

type TabId = PillarId | 'W';

const TABS: { id: TabId; label: string }[] = [
  { id: 'E', label: 'Environment' },
  { id: 'S', label: 'Social' },
  { id: 'G', label: 'Governance' },
  { id: 'W', label: 'Bobot' },
];

const CURRENT_YEAR = new Date().getFullYear();

const FIELD_STYLE: React.CSSProperties = {
  background: 'rgba(57,123,64,0.04)',
  border: '1.5px solid rgba(57,123,64,0.2)',
  color: '#1a2e1b',
  fontFamily: 'Plus Jakarta Sans, DM Sans, sans-serif',
};

/**
 * The input wizard. Holds all form/weight state, computes the ESG result live
 * on every change (the engine is pure, so this is cheap), and persists the
 * snapshot to Supabase on save. Data entry is split into E/S/G tabs plus a
 * weight-configuration tab.
 */
export default function AssessmentWizard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabId>('E');
  const [form, setForm] = useState<FormState>(emptyFormState);
  const [weights, setWeights] = useState<Weights>(defaultWeights);
  const [companyName, setCompanyName] = useState('');
  const [period, setPeriod] = useState(String(CURRENT_YEAR));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const result = useMemo(() => computeEsg(toEsgInput(form), weights), [form, weights]);
  const scoreByElement = useMemo(
    () => new Map(result.elements.map((element) => [element.elementId, element.score])),
    [result],
  );

  const handleField = (indicatorId: string, value: string) =>
    setForm((prev) => ({ ...prev, [indicatorId]: value }));

  const handlePillarWeight = (pillar: PillarId, value: number) =>
    setWeights((prev) => ({ ...prev, pillars: { ...prev.pillars, [pillar]: value } }));

  const handleElementWeight = (elementId: ElementId, value: number) =>
    setWeights((prev) => ({ ...prev, elements: { ...prev.elements, [elementId]: value } }));

  const handleSave = async () => {
    setError(null);
    if (companyName.trim() === '') {
      setError('Isi nama perusahaan dulu.');
      return;
    }
    if (period.trim() === '') {
      setError('Isi periode (tahun) dulu.');
      return;
    }

    const incomplete = findIncompleteElements(form);
    if (incomplete.length > 0) {
      const first = incomplete[0];
      setActiveTab(first.pillar);
      setError(
        `Masih ada ${incomplete.length} elemen yang belum lengkap: ${incomplete
          .map((e) => `${e.elementId} (${e.elementName})`)
          .join(', ')}.`,
      );
      return;
    }

    setSaving(true);
    try {
      await saveAssessment({
        period: period.trim(),
        weights,
        inputs: toEsgInput(form),
        results: result,
        company: { name: companyName.trim() },
      });
      router.push('/dashboard');
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Gagal menyimpan. Coba lagi.');
      setSaving(false);
    }
  };

  const visibleElements = ESG_FRAMEWORK.filter((element) => element.pillar === activeTab);

  return (
    <div className="w-full max-w-3xl mx-auto px-4 py-8">
      {/* Header: title + live overall score */}
      <div className="flex items-center justify-between gap-4 mb-6">
        <div>
          <h1
            className="text-2xl font-bold"
            style={{ color: '#1a2e1b', fontFamily: 'Plus Jakarta Sans, DM Sans, sans-serif' }}
          >
            Input Assessment ESG
          </h1>
          <p className="text-sm mt-1" style={{ color: '#6b7280' }}>
            Isi data operasional · skor dihitung langsung (indikatif, bukan rating audited).
          </p>
        </div>
        <div className="text-center shrink-0">
          <div
            className="text-3xl font-bold leading-none"
            style={{ color: '#397b40', fontFamily: 'Plus Jakarta Sans, DM Sans, sans-serif' }}
          >
            {result.overall.toFixed(1)}
          </div>
          <div className="text-xs mt-1" style={{ color: '#9ca3af' }}>
            Skor ESG
          </div>
        </div>
      </div>

      {/* Company + period */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
        <div className="sm:col-span-2 flex flex-col gap-1.5">
          <label htmlFor="company" className="text-xs font-semibold" style={{ color: '#374151' }}>
            Nama Perusahaan
          </label>
          <input
            id="company"
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            placeholder="PT Contoh Industri"
            className="w-full px-3 py-2.5 rounded-xl text-sm outline-none"
            style={FIELD_STYLE}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="period" className="text-xs font-semibold" style={{ color: '#374151' }}>
            Periode (Tahun)
          </label>
          <input
            id="period"
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            placeholder={String(CURRENT_YEAR)}
            className="w-full px-3 py-2.5 rounded-xl text-sm outline-none"
            style={FIELD_STYLE}
          />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 p-1 rounded-xl" style={{ background: 'rgba(57,123,64,0.06)' }}>
        {TABS.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className="flex-1 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all duration-200"
              style={{
                background: isActive ? '#ffffff' : 'transparent',
                color: isActive ? '#397b40' : '#6b7280',
                boxShadow: isActive ? '0 1px 4px rgba(57,123,64,0.15)' : 'none',
                fontFamily: 'Plus Jakarta Sans, DM Sans, sans-serif',
              }}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Panel */}
      {activeTab === 'W' ? (
        <WeightPanel
          weights={weights}
          onPillarChange={handlePillarWeight}
          onElementChange={handleElementWeight}
        />
      ) : (
        visibleElements.map((element) => (
          <ElementCard
            key={element.id}
            element={element}
            values={form}
            score={scoreByElement.get(element.id) ?? 0}
            onChange={handleField}
          />
        ))
      )}

      {/* Error + actions */}
      {error && (
        <p
          role="alert"
          className="text-sm rounded-xl px-4 py-2.5 mt-4"
          style={{ background: 'rgba(220,38,38,0.08)', color: '#b91c1c' }}
        >
          {error}
        </p>
      )}

      <div className="flex justify-end mt-6">
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="px-6 py-3 rounded-xl text-sm font-bold tracking-wide transition-all duration-300"
          style={{
            background: saving
              ? 'rgba(57,123,64,0.6)'
              : 'linear-gradient(135deg, #397b40 0%, #2d6233 100%)',
            color: '#ffffff',
            boxShadow: saving ? 'none' : '0 4px 16px rgba(57,123,64,0.35)',
            cursor: saving ? 'not-allowed' : 'pointer',
            fontFamily: 'Plus Jakarta Sans, DM Sans, sans-serif',
          }}
        >
          {saving ? 'Menyimpan…' : 'Simpan Assessment'}
        </button>
      </div>
    </div>
  );
}
