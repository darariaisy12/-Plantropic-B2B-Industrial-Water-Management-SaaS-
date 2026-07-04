'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import AppLogo from '@/components/ui/AppLogo';
import { createClient } from '@/lib/supabase/client';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const supabase = createClient();
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    setLoading(false);
    if (resetError) {
      setError('Terjadi kesalahan. Silakan coba lagi.');
      return;
    }
    // Always show the same success message regardless of whether the email
    // is registered — avoids leaking account existence.
    setSent(true);
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
              Reset password
            </h1>
            <p className="text-sm text-center mt-1" style={{ color: '#6b7280' }}>
              Masukkan email akun Anda, kami akan kirimkan link untuk reset password.
            </p>
          </div>

          {sent ? (
            <div
              role="status"
              className="text-sm rounded-xl px-4 py-3 text-center"
              style={{ background: 'rgba(57,123,64,0.08)', color: '#397b40' }}
            >
              Kalau email tersebut terdaftar, link reset password sudah kami kirim. Silakan cek inbox (dan folder spam).
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="email"
                  className="text-sm font-semibold"
                  style={{ color: '#374151', fontFamily: 'Plus Jakarta Sans, DM Sans, sans-serif' }}
                >
                  Email address
                </label>
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
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
                {loading ? 'Mengirim…' : 'Kirim link reset'}
              </button>
            </form>
          )}

          <p className="text-center text-sm mt-6" style={{ color: '#6b7280' }}>
            Ingat password Anda?{' '}
            <Link href="/login" className="font-semibold transition-colors" style={{ color: '#397b40' }}>
              Kembali ke login
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
