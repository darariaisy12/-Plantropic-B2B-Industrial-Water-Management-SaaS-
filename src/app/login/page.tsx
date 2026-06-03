'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation'
; // Tambahkan ini
import AppLogo from '@/components/ui/AppLogo';

export default function LoginPage() {
  const router = useRouter(); // Inisialisasi router
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // Simulasi proses autentikasi (misal: verifikasi ke backend)
    setTimeout(() => {
      setLoading(false);
      // Set auth state in localStorage
      localStorage.setItem('isLoggedIn', 'true');
      localStorage.setItem('userName', 'John Doe');
      // Redirect to homepage
      router.push('/'); 
    }, 1500);
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

      {/* Decorative leaf pattern */}
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
              Welcome back
            </h1>
            <p className="text-sm text-center mt-1" style={{ color: '#6b7280' }}>
              Sign in to your Plantropic account
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {/* Email */}
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
              <div className="flex items-center justify-between">
                <label
                  htmlFor="password"
                  className="text-sm font-semibold"
                  style={{ color: '#374151', fontFamily: 'Plus Jakarta Sans, DM Sans, sans-serif' }}
                >
                  Password
                </label>
                <Link
                  href="#"
                  className="text-xs font-medium transition-colors"
                  style={{ color: '#397b40' }}
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full px-4 py-3 pr-11 rounded-xl text-sm outline-none transition-all duration-200"
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
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-md transition-colors"
                  style={{ color: '#9ca3af' }}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Remember me */}
            <div className="flex items-center gap-2.5">
              <input
                id="remember"
                type="checkbox"
                className="w-4 h-4 rounded cursor-pointer"
                style={{ accentColor: '#397b40' }}
              />
              <label
                htmlFor="remember"
                className="text-sm cursor-pointer"
                style={{ color: '#6b7280' }}
              >
                Keep me signed in
              </label>
            </div>

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
                transform: loading ? 'none' : undefined,
              }}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Signing in…
                </span>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          {/* ... [Sisa kode Anda tetap sama] ... */}
          
          {/* Divider */}
          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px" style={{ background: 'rgba(57,123,64,0.15)' }} />
            <span className="text-xs" style={{ color: '#9ca3af' }}>or continue with</span>
            <div className="flex-1 h-px" style={{ background: 'rgba(57,123,64,0.15)' }} />
          </div>

          <button
            type="button"
            className="w-full flex items-center justify-center gap-3 py-3 rounded-xl text-sm font-semibold transition-all duration-200"
            style={{
              background: 'rgba(255,255,255,0.8)',
              border: '1.5px solid rgba(57,123,64,0.18)',
              color: '#374151',
              fontFamily: 'Plus Jakarta Sans, DM Sans, sans-serif',
            }}
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continue with Google
          </button>

          <p className="text-center text-sm mt-6" style={{ color: '#6b7280' }}>
            Don&apos;t have an account?{' '}
            <Link
              href="/register"
              className="font-semibold transition-colors"
              style={{ color: '#397b40' }}
            >
              Create account
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
