# 📘 PLANTROPIC — FINAL BRIEF

> Status terakhir: Semua 10 fase selesai (engine, auth, input wizard, dashboard, AI insight, report GRI+PDF, riwayat & tren, pengaturan, hardening). Disusun 2026-06-24, update 2026-06-25.

## 1. Produk (1 kalimat)
Platform self-service konsultan ESG: **input data operasional → hitung skor ESG 14 elemen (deterministik) → AI kasih kesimpulan & rekomendasi → keluar laporan keberlanjutan gaya GRI.**

## 2. Tech Stack

| Layer | Teknologi | Status |
|---|---|---|
| Framework | Next.js 15 (App Router) + React 19 | ✅ terpasang |
| Bahasa | TypeScript (strict mode) | ✅ |
| Styling | Tailwind 3.4 + design system custom (`glass-card`, `gradient-text-primary`) | ✅ dari landing |
| Charts | Recharts | ✅ terinstall |
| Icons | Heroicons + lucide-react | ✅ |
| Engine perhitungan | TypeScript murni (pure functions, no I/O) | ✅ Fase 0 |
| Testing | Vitest + @vitest/coverage-v8 | ✅ terinstall |
| Database | Supabase (Postgres) | ⏳ Fase 3 |
| Auth | Supabase Auth (single-user: 1 akun = 1 perusahaan) | ⏳ Fase 3 |
| Isolasi data | Supabase RLS (`user_id = auth.uid()`) | ⏳ Fase 3 |
| Client DB | @supabase/ssr + @supabase/supabase-js | ⏳ Fase 3 |
| AI | Groq (Llama 3.3 70B, free tier, no hidden thinking-token overhead) via groq-sdk | ⏳ Fase 6 |
| Endpoint AI | Next.js Route Handler `/api/insight` (server-side, key aman) | ⏳ Fase 6 |
| Export report | Print-to-PDF browser (upgrade ke lib nanti) | ⏳ Fase 7 |
| Process manager | PM2 (port 4028) | ✅ disetup |
| Deploy | Netlify (@netlify/plugin-nextjs) | ✅ siap |

**Prinsip kunci:** Engine (TS murni) tidak pernah manggil AI/DB. AI tidak pernah ngitung angka — cuma baca `EsgResult` yang udah jadi. Ini yang bikin angkanya auditable.

## 3. Alur user (5 langkah)
```
LOGIN → ISI DATA (14 elemen, 3 tab E/S/G) → KLIK HITUNG → LIHAT DASHBOARD → DOWNLOAD REPORT
```

## 4. Engine: 2 sub-mesin + bobot + AI
- Mesin A (kuantitatif): angka dari rumus — carbon (Scope 1/2/3 × emission factor), recovery limbah %, intensitas energi → dinormalisasi ke 0–100
- Mesin B (kualitatif): kuesioner indikator GRI → skor maturity 0–100
- Agregasi: elemen → pilar (E/S/G) → ESG Score, pakai bobot yang user atur sendiri
- AI (Claude): kesimpulan, rekomendasi prioritas, benchmark estimasi + disclaimer, narasi report

## 5. Output
- Dashboard: ring skor ESG + bar E/S/G + radar 14 elemen + breakdown emisi (Recharts) + panel AI insight
- Report PDF: Ringkasan Eksekutif (AI) · Skor & Metodologi · E/S/G detail · Rekomendasi · Referensi GRI

## 6. Data (Supabase, single-user)
```
auth.users                  ← Supabase
companies   (user_id, name, industry, scale)          1 user : 1 company
assessments (user_id, period, weights jsonb,
             inputs jsonb, results jsonb, created_at)
ai_insights (assessment_id, content, model, created_at)
RLS ON semua tabel → user cuma lihat datanya sendiri
```
Guna: bikin assessment per periode → bandingin tren antar tahun + simpan riwayat report.

## 7. Env (`.env.local`, jangan commit)
```
NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY   (server only)
GROQ_API_KEY                (server only)
```

## 8. Breakdown kerjaan (per fase)

| Fase | Yang dikerjain | Pakai apa | Status |
|---|---|---|---|
| 0 | Fondasi: `types.ts`, `framework.ts` (14 elemen), test setup | TS, Vitest | ✅ SELESAI (9/9 test, type-check clean) |
| 1 | Mesin kuantitatif: `emissionFactors.ts` + `calculators.ts` (E1–E4) | TS, Vitest (TDD) | ✅ SELESAI (26/26 test, type-check clean) |
| 2 | Scoring + `weights.ts` + `aggregate.ts` + `computeEsg()` | TS, Vitest (TDD) | ✅ SELESAI (43/43 test, type-check clean) |
| 3 | Supabase setup + Auth + schema + RLS, sambungin login/register | Supabase, @supabase/ssr | ✅ KODE SELESAI (client/server/middleware, RLS migration, login/register, confirm+signout route, dashboard ter-proteksi). User wajib: jalanin `0001_init.sql` |
| 4 | Input wizard UI (3 tab E/S/G) + config bobot → simpan DB | React, Tailwind | ✅ SELESAI (route `/assessment` ter-proteksi, 4 tab E/S/G/Bobot, live score, simpan `companies`+`assessments`, 51/51 test, type-check clean) |
| 5 | Dashboard hasil (ring, bar, radar, charts) | React, Recharts | ✅ SELESAI (ring skor, bar E/S/G, radar 14 elemen, breakdown emisi Scope1/2, panel AI placeholder, empty-state kalau belum ada assessment, 51/51 test, type-check clean) |
| 6 | AI layer: `/api/insight` + prompt + panel insight | Groq SDK (Llama 3.3 70B), Next route | ✅ SELESAI (route auth-gated 401 tanpa login, prompt builder pure, panel fetch real-time, migrated dari Gemini ke Groq krn rate limit, type-check clean) |
| 7 | Report GRI-style + export PDF | React, print CSS | ✅ SELESAI (`/report` ter-proteksi 307 tanpa login, ringkasan AI + skor/metodologi + detail E/S/G + referensi GRI, tombol Unduh PDF via print, type-check clean, 51/51 test) |
| 8 | Riwayat & Tren multi-periode | React, Recharts LineChart | ✅ SELESAI (`/history` ter-proteksi 307, `getAllAssessments()`, line chart tren skor + tabel riwayat) |
| 9 | Pengaturan profil perusahaan | React | ✅ SELESAI (`/settings` ter-proteksi 307, `getCompany()`/`upsertCompany()`, form edit nama/industri/skala) |
| 10 | Hardening: error boundary + production build check | Next.js `error.tsx`, `next build` | ✅ SELESAI (global error boundary, `npm run build` sukses 16 route, type-check clean, 51/51 test, semua route protected dikonfirmasi 307) |

## 9. Keputusan yang udah dikunci
- Scope: Full ESG (14 elemen E+S+G)
- Peran AI: interpretasi & rekomendasi only; angka deterministik
- Bobot: user atur sendiri (per pilar/elemen), disimpan per-assessment
- Benchmark: AI estimasi + disclaimer (belum ada DB benchmark)
- Metodologi: GRI 14 elemen dari `jurnal/` + regulasi Indonesia (PP 22/2021, dll)
- Auth: single-user (1 akun = 1 perusahaan), siap upgrade ke multi-tenant

## 10. Risiko utama
- Faktor emisi & rubrik perlu validasi domain → sitasi sumber, tandai DRAFT, gampang di-tune
- RLS lupa nyala → data bocor antar user → wajib test akses sebelum isi data
- Key bocor → semua key server-only, `.env.local` di-gitignore
- Skor dianggap "resmi" → label jelas "indikatif, bukan rating audited"
