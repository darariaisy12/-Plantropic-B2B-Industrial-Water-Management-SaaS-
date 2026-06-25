# Metodologi Scoring — Sumber & Keterbatasan

> Dokumen ini menjelaskan dasar setiap formula/threshold kuantitatif di
> `src/lib/esg/calculators.ts` dan `src/lib/esg/emissionFactors.ts`, supaya
> skor yang dihasilkan bisa dipertanggungjawabkan ke klien sebagai konsultan
> — bukan angka kira-kira tanpa sumber.

## E1 — Emisi Gas Rumah Kaca

**Faktor emisi** (kgCO2e per unit) — sudah bersumber resmi:
- Listrik: 0.794 kgCO2e/kWh — grid interkoneksi Jamali, Kementerian ESDM / IESR
- Diesel/bensin/gas alam: UK DEFRA/BEIS GHG Conversion Factors + IPCC 2006 Guidelines (Scope 1)

**Threshold skor (BEST=50, WORST=1000 tCO2e/tahun)** — ⚠️ **masih DRAFT**.
Tidak ditemukan standar absolut lintas-industri untuk total emisi perusahaan;
skala emisi inherently tergantung ukuran & sektor perusahaan. Idealnya
diganti dengan benchmark intensitas (tCO2e per ton output) per sektor —
belum tersedia datanya saat implementasi. Threshold ini cuma estimasi kasar
untuk perusahaan kecil-menengah dan harus disesuaikan manual per klien.

## E2 — Pengelolaan Limbah Padat

**Formula:** `skor = (tingkat daur ulang aktual / 70%) × 100`, dibatasi 0-100.

**Sumber benchmark 70%:** Jakstranas — Strategi Nasional Pengelolaan Sampah
(Perpres No. 97/2017), target nasional **70% sampah tertangani pada 2025**.
⚠️ Catatan: target Jakstranas ditujukan untuk sampah perkotaan, bukan limbah
industri secara spesifik — dipakai di sini sebagai anchor kebijakan nasional
terbaik yang tersedia, bukan standar industri yang presisi.

## E3 — Penggunaan Energi

**Formula:** `skor = (% energi terbarukan aktual / 23%) × 100`, dibatasi 0-100.

**Sumber benchmark 23%:** RUEN/KEN — Kebijakan Energi Nasional (Perpres No.
22/2017), target bauran energi terbarukan nasional **23% pada 2030**.
Intensitas energi (kWh/ton output) dilaporkan di `detail` tapi tidak
memengaruhi skor — belum ada benchmark intensitas lintas-industri yang
ditemukan saat implementasi.

## E4 — Penggunaan Bahan Baku

**Formula:** `skor = % bahan baku daur ulang` (linear, 1:1).

⚠️ **Belum ada benchmark nasional/sektoral yang ditemukan.** Tidak seperti
E2/E3, formula ini masih rasio polos tanpa anchor kebijakan. Literatur
circular economy (lihat `jurnal/E4_Bahan_Baku/`) mendukung pendekatan
recycled-content secara konseptual, tapi tidak memberi angka target yang
bisa langsung dipakai. Perlu validasi lebih lanjut sebelum dipakai untuk
klaim formal ke klien — sampaikan sebagai estimasi indikatif.

## Status ringkas

| Elemen | Formula | Anchor | Status |
|---|---|---|---|
| E1 (faktor emisi) | rumus konversi | ESDM/IESR, DEFRA, IPCC | ✅ Tervalidasi |
| E1 (threshold skor) | linear band | — | ⚠️ DRAFT, perlu intensitas per sektor |
| E2 | relatif ke target | Jakstranas (Perpres 97/2017) | ✅ Tervalidasi (anchor kebijakan nasional) |
| E3 (renewable) | relatif ke target | RUEN/KEN (Perpres 22/2017) | ✅ Tervalidasi (anchor kebijakan nasional) |
| E3 (intensitas) | dilaporkan saja | — | ⚠️ Belum discoring |
| E4 | linear 1:1 | — | ⚠️ DRAFT, belum ada anchor |

*Terakhir diperbarui: 2026-06-25.*
