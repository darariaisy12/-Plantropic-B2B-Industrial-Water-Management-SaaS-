/**
 * Pengaturan (Fase 9). Lets the signed-in user view and edit their company
 * profile (name, industry, scale) — the same row consumed by the assessment
 * wizard and report header.
 */

'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getCompany, upsertCompany, type CompanyProfile } from '@/lib/data/assessments';

const CARD_STYLE: React.CSSProperties = {
  background: 'rgba(255,255,255,0.8)',
  border: '1px solid rgba(57,123,64,0.15)',
  borderRadius: '20px',
  boxShadow: '0 4px 20px rgba(57,123,64,0.08)',
};

const INPUT_STYLE: React.CSSProperties = {
  border: '1px solid rgba(57,123,64,0.2)',
  borderRadius: '12px',
  padding: '10px 14px',
  fontSize: '14px',
  width: '100%',
};

export default function SettingsView() {
  const [profile, setProfile] = useState<CompanyProfile>({ name: '', industry: '', scale: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    let cancelled = false;
    getCompany()
      .then((company) => {
        if (!cancelled && company) setProfile(company);
      })
      .catch((err: unknown) => {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Gagal memuat profil.');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  async function handleSubmit(e: React.FormEvent): Promise<void> {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSaved(false);
    try {
      await upsertCompany(profile);
      setSaved(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Gagal menyimpan profil.');
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="w-full max-w-lg mx-auto px-4 py-16 text-center">
        <p className="text-sm" style={{ color: '#6b7280' }}>
          Memuat pengaturan…
        </p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-lg mx-auto px-4 py-8">
      <div className="flex items-center justify-between gap-4 mb-6">
        <h1
          className="text-2xl font-bold"
          style={{ color: '#1a2e1b', fontFamily: 'Plus Jakarta Sans, DM Sans, sans-serif' }}
        >
          Pengaturan
        </h1>
        <Link href="/dashboard" className="text-xs font-semibold" style={{ color: '#397b40' }}>
          ← Dashboard
        </Link>
      </div>

      <form onSubmit={handleSubmit} className="p-5 flex flex-col gap-4" style={CARD_STYLE}>
        <h2 className="text-sm font-semibold" style={{ color: '#374151' }}>
          Profil Perusahaan
        </h2>

        <label className="flex flex-col gap-1.5 text-xs font-semibold" style={{ color: '#374151' }}>
          Nama Perusahaan
          <input
            type="text"
            required
            value={profile.name}
            onChange={(e) => setProfile({ ...profile, name: e.target.value })}
            style={INPUT_STYLE}
          />
        </label>

        <label className="flex flex-col gap-1.5 text-xs font-semibold" style={{ color: '#374151' }}>
          Industri
          <input
            type="text"
            value={profile.industry ?? ''}
            onChange={(e) => setProfile({ ...profile, industry: e.target.value })}
            style={INPUT_STYLE}
          />
        </label>

        <label className="flex flex-col gap-1.5 text-xs font-semibold" style={{ color: '#374151' }}>
          Skala Usaha
          <input
            type="text"
            value={profile.scale ?? ''}
            onChange={(e) => setProfile({ ...profile, scale: e.target.value })}
            style={INPUT_STYLE}
          />
        </label>

        {error && (
          <p className="text-xs rounded-lg px-3 py-2" style={{ background: 'rgba(220,38,38,0.08)', color: '#b91c1c' }}>
            {error}
          </p>
        )}
        {saved && (
          <p className="text-xs rounded-lg px-3 py-2" style={{ background: 'rgba(57,123,64,0.08)', color: '#397b40' }}>
            Profil tersimpan.
          </p>
        )}

        <button
          type="submit"
          disabled={saving}
          className="px-4 py-2.5 rounded-xl text-sm font-bold tracking-wide transition-all duration-300 disabled:opacity-60"
          style={{
            background: 'linear-gradient(135deg, #397b40 0%, #2d6233 100%)',
            color: '#ffffff',
          }}
        >
          {saving ? 'Menyimpan…' : 'Simpan'}
        </button>
      </form>
    </div>
  );
}
