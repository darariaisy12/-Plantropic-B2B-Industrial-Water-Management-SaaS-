'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import AppLogo from '@/components/ui/AppLogo';
import { createClient } from '@/lib/supabase/client';

export default function RegisterPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setInfo(null);
    setLoading(true);

    const supabase = createClient();
    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } },
    });

    setLoading(false);
    if (signUpError) {
      setError(signUpError.message);
      return;
    }

    // With email confirmation enabled, no session is returned yet.
    if (!data.session) {
      setInfo('Akun dibuat. Cek email kamu untuk konfirmasi, lalu sign in.');
      return;
    }

    router.push('/dashboard');
    router.refresh();
  };

  return (
    <main
      className="min-h-screen flex items-center justify-center relative overflow-hidden"
      style={{ background: '#F8FAFC' }}
    >
      {/* Ambient background blobs */}
      <div
        className="absolute top-[-120px] left-[-100px] w-[480px] h-[480px] rounded-full opacity-20 blur-3xl pointer-events-none"
        style={{ background: 'radial-gradient(circle, #397b40 0%, transparent 70%)' }}
      />
      <div
        className="absolute bottom-[-80px] right-[-80px] w-[360px] h-[360px] rounded-full opacity-15 blur-3xl pointer-events-none"
        style={{ background: 'radial-gradient(circle, #7B6F39 0%, transparent 70%)' }}
      />
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full opacity-5 blur-3xl pointer-events-none"
        style={{ background: 'radial-gradient(circle, #397b40 0%, #7B6F39 50%, transparent 70%)' }}
      />

      {/* Decorative leaves */}
      <div className="absolute top-8 right-12 opacity-10 pointer-events-none select-none text-[120px]">
        🌿
      </div>
      <div className="absolute bottom-12 left-10 opacity-8 pointer-events-none select-none text-[80px]">
        🍃
      </div>

      {/* Card */}
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
          {/* Logo & Brand */}
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
              Create your account
            </h1>
            <p className="text-sm text-center mt-1" style={{ color: '#6b7280' }}>
              Join Plantropic and start your green journey
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {/* Full Name */}
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="fullName"
                className="text-sm font-semibold"
                style={{ color: '#374151', fontFamily: 'Plus Jakarta Sans, DM Sans, sans-serif' }}
              >
                Full Name
              </label>
              <input
                id="fullName"
                type="text"
                autoComplete="name"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="John Doe"
                className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all duration-200"
                style={{
                  background: 'rgba(57,123,64,0.04)',
                  border: '1.5px solid rgba(57,123,64,0.2)',
                  color: '#1a2e1b',
                  fontFamily: 'Plus Jakarta Sans, DM Sans, sans-serif',
                }}
                onFocus={(e) => {
                  e.target.style.border = '1.5px solid #397b40';
                  e.target.style.boxShadow = '0 0 0 3px rgba(57,123,64,0.10)';
                }}
                onBlur={(e) => {
                  e.target.style.border = '1.5px solid rgba(57,123,64,0.2)';
                  e.target.style.boxShadow = 'none';
                }}
              />
            </div>

            {/* Email */}
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="email"
                className="text-sm font-semibold"
                style={{ color: '#374151', fontFamily: 'Plus Jakarta Sans, DM Sans, sans-serif' }}
              >
                Email Address
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
                onFocus={(e) => {
                  e.target.style.border = '1.5px solid #397b40';
                  e.target.style.boxShadow = '0 0 0 3px rgba(57,123,64,0.10)';
                }}
                onBlur={(e) => {
                  e.target.style.border = '1.5px solid rgba(57,123,64,0.2)';
                  e.target.style.boxShadow = 'none';
                }}
              />
            </div>

            {/* Password */}
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="password"
                className="text-sm font-semibold"
                style={{ color: '#374151', fontFamily: 'Plus Jakarta Sans, DM Sans, sans-serif' }}
              >
                Password
              </label>
              <input
                id="password"
                type="password"
                autoComplete="new-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Create a strong password"
                className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all duration-200"
                style={{
                  background: 'rgba(57,123,64,0.04)',
                  border: '1.5px solid rgba(57,123,64,0.2)',
                  color: '#1a2e1b',
                  fontFamily: 'Plus Jakarta Sans, DM Sans, sans-serif',
                }}
                onFocus={(e) => {
                  e.target.style.border = '1.5px solid #397b40';
                  e.target.style.boxShadow = '0 0 0 3px rgba(57,123,64,0.10)';
                }}
                onBlur={(e) => {
                  e.target.style.border = '1.5px solid rgba(57,123,64,0.2)';
                  e.target.style.boxShadow = 'none';
                }}
              />
            </div>

            {/* Terms & Conditions */}
            <div className="flex items-start gap-2.5">
              <input
                id="terms"
                type="checkbox"
                required
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
                className="w-4 h-4 mt-0.5 rounded cursor-pointer flex-shrink-0"
                style={{ accentColor: '#397b40' }}
              />
              <label
                htmlFor="terms"
                className="text-sm cursor-pointer leading-relaxed"
                style={{ color: '#6b7280' }}
              >
                I agree to the{' '}
                <Link href="#" className="font-semibold transition-colors" style={{ color: '#397b40' }}>
                  Terms & Conditions
                </Link>{' '}
                and{' '}
                <Link href="#" className="font-semibold transition-colors" style={{ color: '#397b40' }}>
                  Privacy Policy
                </Link>
              </label>
            </div>

            {/* Error / info message */}
            {error && (
              <p
                role="alert"
                className="text-sm rounded-xl px-4 py-2.5"
                style={{ background: 'rgba(220,38,38,0.08)', color: '#b91c1c' }}
              >
                {error}
              </p>
            )}
            {info && (
              <p
                className="text-sm rounded-xl px-4 py-2.5"
                style={{ background: 'rgba(57,123,64,0.08)', color: '#397b40' }}
              >
                {info}
              </p>
            )}

            {/* Submit */}
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
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Creating account...
                </span>
              ) : (
                'Sign Up'
              )}
            </button>
          </form>

          <p className="text-center text-sm mt-6" style={{ color: '#6b7280' }}>
            Already have an account?{' '}
            <Link
              href="/login"
              className="font-semibold transition-colors"
              style={{ color: '#397b40' }}
            >
              Sign In
            </Link>
          </p>
        </div>

        <div
          className="flex items-center justify-center gap-1.5 py-3 rounded-b-3xl text-xs font-medium"
          style={{
            background: 'linear-gradient(90deg, rgba(57,123,64,0.08) 0%, rgba(123,111,57,0.08) 100%)',
            borderTop: '1px solid rgba(57,123,64,0.10)',
            color: '#397b40',
          }}
        >
          <span>🌱</span>
          <span>Committed to a sustainable future</span>
        </div>
      </div>
    </main>
  );
}
