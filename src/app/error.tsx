/**
 * App-wide error boundary (Fase 10 hardening). Catches uncaught render/data
 * errors below the root layout so a broken page shows a recoverable screen
 * instead of a blank crash.
 */

'use client';

export default function GlobalError({ reset }: { error: Error; reset: () => void }) {
  return (
    <main
      className="min-h-screen flex items-center justify-center px-4"
      style={{ background: '#F8FAFC' }}
    >
      <div className="text-center max-w-md">
        <span className="text-4xl">⚠️</span>
        <h1
          className="text-xl font-bold mt-4"
          style={{ color: '#1a2e1b', fontFamily: 'Plus Jakarta Sans, DM Sans, sans-serif' }}
        >
          Terjadi kesalahan
        </h1>
        <p className="text-sm mt-2" style={{ color: '#6b7280' }}>
          Ada yang gak beres. Coba muat ulang halaman ini.
        </p>
        <button
          type="button"
          onClick={reset}
          className="inline-block mt-6 px-6 py-2.5 rounded-xl text-sm font-bold tracking-wide transition-all duration-300"
          style={{
            background: 'linear-gradient(135deg, #397b40 0%, #2d6233 100%)',
            color: '#ffffff',
          }}
        >
          Coba lagi
        </button>
      </div>
    </main>
  );
}
