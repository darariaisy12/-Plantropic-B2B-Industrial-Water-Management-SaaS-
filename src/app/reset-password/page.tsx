'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { z } from 'zod';
import AppLogo from '@/components/ui/AppLogo';
import { createClient } from '@/lib/supabase/client';

const passwordSchema = z
  .object({
    password: z.string().min(6, 'Password minimal 6 karakter.'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Konfirmasi password tidak cocok.',
    path: ['confirmPassword'],
  });

type SessionState = 'checking' | 'valid' | 'invalid';

export default function ResetPasswordPage() {
  const router = useRouter();
  const [sessionState, setSessionState] = useState<SessionState>('checking');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSessionState(session ? 'valid' : 'invalid');
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const parsed = passwordSchema.safeParse({ password, confirmPassword });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? 'Input tidak valid.');
      return;
    }

    setLoading(true);
    const supabase = createClient();
    const { error: updateError } = await supabase.auth.updateUser({ password: parsed.data.password });
    setLoading(false);

    if (updateError) {
      setError(updateError.message);
      return;
    }

    await supabase.auth.signOut();
    router.push('/login?reset=success');
  };

  return (
    <main
      className="min-h-screen flex items-center justify-center relative overflow-hidden"
      style={{ background: '#F8FAFC' }}
    >
      <div
        className="absolute top-[-120px] left-[-100px] w-[480px] h-[480px] rounded-full opacity-20 blur-3xl pointer-events-none"
        style={{ background: 'radial-gradient(circle, #397b40 0%, transparent 70%)' }}
      />
      <div
        className="absolute bottom-[-80px] right-[-80px] w-[360px] h-[360px] rounded-full opacity-15 blur-3xl pointer-events-none"
        style={{ background: 'radial-gradient(circle, #7B6F39 0%, transparent 70%)' }}
      />

      <div
        className="relative z-10 w-full max-w-md mx-4"
        style={{
          background: 'rgba(255,255,255,0.72)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: '1px solid rgba(57,123,64,0.15)',
          borderRadius: '24px',
          boxShadow: '0 8px 40px rgba(57,123,64,0.10), 0 2px 8px rgba(0,0,0,0.06)',
        }}
      >
        <div className="px-8 pt-10 pb-8">
          <div className="flex flex-col items-center mb-8">
            <Link href="/" className="flex items-center gap-2.5 group mb-4">
              <AppLogo
                src="/assets/images/WhatsApp_Image_2026-05-21_at_07.14.10-1779374119124.jpeg"
                size={44}
                className="rounded-xl overflow-hidden shadow-sm"
              />
              <span
                className="font-bold text-2xl tracking-tight"
                style={{ color: '#1a2e1b', fontFamily: 'Plus Jakarta Sans, DM Sans, sans-serif' }}
              >
                Plantropic
              </span>
            </Link>
            <h1
              className="text-xl font-bold text-center"
              style={{ color: '#1a2e1b', fontFamily: 'Plus Jakarta Sans, DM Sans, sans-serif' }}
            >
              Buat password baru
            </h1>
          </div>

          {sessionState === 'checking' && (
            <p className="text-sm text-center" style={{ color: '#6b7280' }}>
              Memeriksa link reset password…
            </p>
          )}

          {sessionState === 'invalid' && (
            <div className="flex flex-col gap-4">
              <p
                role="alert"
                className="text-sm rounded-xl px-4 py-3 text-center"
                style={{ background: 'rgba(220,38,38,0.08)', color: '#b91c1c' }}
              >
                Link reset password tidak valid atau sudah kedaluwarsa.
              </p>
              <Link
                href="/forgot-password"
                className="w-full py-3.5 rounded-xl text-sm font-bold tracking-wide text-center transition-all duration-300"
                style={{
                  background: 'linear-gradient(135deg, #397b40 0%, #2d6233 100%)',
                  color: '#ffffff',
                  fontFamily: 'Plus Jakarta Sans, DM Sans, sans-serif',
                }}
              >
                Minta link baru
              </Link>
            </div>
          )}

          {sessionState === 'valid' && (
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="password"
                  className="text-sm font-semibold"
                  style={{ color: '#374151', fontFamily: 'Plus Jakarta Sans, DM Sans, sans-serif' }}
                >
                  Password baru
                </label>
                <input
                  id="password"
                  type="password"
                  autoComplete="new-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Minimal 6 karakter"
                  className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all duration-200"
                  style={{
                    background: 'rgba(57,123,64,0.04)',
                    border: '1.5px solid rgba(57,123,64,0.2)',
                    color: '#1a2e1b',
                    fontFamily: 'Plus Jakarta Sans, DM Sans, sans-serif',
                  }}
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="confirmPassword"
                  className="text-sm font-semibold"
                  style={{ color: '#374151', fontFamily: 'Plus Jakarta Sans, DM Sans, sans-serif' }}
                >
                  Konfirmasi password
                </label>
                <input
                  id="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Ulangi password baru"
                  className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all duration-200"
                  style={{
                    background: 'rgba(57,123,64,0.04)',
                    border: '1.5px solid rgba(57,123,64,0.2)',
                    color: '#1a2e1b',
                    fontFamily: 'Plus Jakarta Sans, DM Sans, sans-serif',
                  }}
                />
              </div>

              {error && (
                <p
                  role="alert"
                  className="text-sm rounded-xl px-4 py-2.5"
                  style={{ background: 'rgba(220,38,38,0.08)', color: '#b91c1c' }}
                >
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-xl text-sm font-bold tracking-wide transition-all duration-300 mt-1"
                style={{
                  background: loading
                    ? 'rgba(57,123,64,0.6)'
                    : 'linear-gradient(135deg, #397b40 0%, #2d6233 100%)',
                  color: '#ffffff',
                  boxShadow: loading ? 'none' : '0 4px 16px rgba(57,123,64,0.35)',
                  fontFamily: 'Plus Jakarta Sans, DM Sans, sans-serif',
                  cursor: loading ? 'not-allowed' : 'pointer',
                }}
              >
                {loading ? 'Menyimpan…' : 'Simpan password baru'}
              </button>
            </form>
          )}
        </div>
      </div>
    </main>
  );
}
