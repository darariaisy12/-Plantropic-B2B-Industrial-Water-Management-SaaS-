# Metodologi Scoring ESG — Sumber & Dasar Hukum

> Dokumen ini menjelaskan dasar setiap formula, threshold, dan rubrik kualitatif
> di `src/lib/esg/`. Setiap angka dapat dipertanggungjawabkan kepada klien
> karena bersumber dari regulasi Indonesia yang berlaku, standar GRI, atau
> literatur akademik yang dikutip secara eksplisit.
>
> **Status kolom:** ✅ Tervalidasi | ⚠️ DRAFT | 📋 Proxy kebijakan

---

## Pilar E — Lingkungan (Environmental)

### E1 — Emisi Gas Rumah Kaca (GRI 305)
**Regulasi:** PP 98/2021 tentang Penyelenggaraan NEK; KLHK No. 21/2022 tentang
Tata Laksana Nilai Ekonomi Karbon; Permen LHK No. P.93/2018 (pelaporan GRK).

**Faktor emisi** (kgCO2e per unit) — ✅ Tervalidasi:
| Bahan Bakar | Faktor | Sumber |
|---|---|---|
| Listrik PLN (Scope 2) | 0.794 kgCO2e/kWh | Kementerian ESDM / IESR (2023), Grid Jamali |
| Solar/Diesel (Scope 1) | 2.68 kgCO2e/L | DEFRA/BEIS GHG Conversion Factors (2023) |
| Bensin (Scope 1) | 2.31 kgCO2e/L | DEFRA/BEIS GHG Conversion Factors (2023) |
| Gas Alam (Scope 1) | 2.02 kgCO2e/m³ | IPCC 2006 Guidelines, Ch. 2 |

**Formula skor** — Intensitas emisi (primer, ✅ lebih defensibel):
```
intensitas = total tCO2e / ton output produksi
skor = 100 − clamp((intensitas − 0.5) / (5.0 − 0.5) × 100, 0, 100)
```
- ≤ 0.5 tCO2e/ton → 100  (best-practice: semen best-in-class ≈0.4, baja DRI ≈0.5)
- ≥ 5.0 tCO2e/ton →   0  (high-intensity: rata-rata global aluminium primer ≈12)
- GRI 305-4 merekomendasikan pengungkapan intensitas sebagai metrik perbandingan

**Fallback absolut** (⚠️ DRAFT — dipakai jika output produksi tidak dilaporkan):
```
skor = 100 − clamp((total tCO2e − 50) / (1000 − 50) × 100, 0, 100)
```
Catatan: threshold absolut tidak bisa dibandingkan lintas ukuran perusahaan;
ganti dengan benchmark per-sektor begitu data KLHK/IDX ESG tersedia.

---

### E2 — Pengelolaan Limbah Padat (GRI 306)
**Regulasi:** PP 22/2021 tentang Penyelenggaraan Perlindungan dan Pengelolaan
Lingkungan Hidup; Perpres 97/2017 (Jakstranas Sampah); PP 101/2014 (Limbah B3).

**Formula:** `skor = clamp(tingkat_daur_ulang_pct / 70 × 100, 0, 100)`

**Benchmark 70%:** Target nasional Jakstranas 2025 — "70% sampah tertangani"
(Perpres No. 97/2017). 📋 Catatan: Jakstranas menargetkan sampah perkotaan,
bukan limbah industri; dipakai sebagai anchor kebijakan nasional terbaik.

**Komponen B3** (kualitatif): Apakah limbah B3 dikelola pihak berizin?
- Ya → 100 | Tidak → 0
- Basis: PP 101/2014 Pasal 4 — wajib menyerahkan ke pengumpul/pengolah berizin KLHK.

Skor akhir E2 = rata-rata(skor_daur_ulang, skor_B3).

---

### E3 — Penggunaan Energi (GRI 302)
**Regulasi:** Perpres 22/2017 (RUEN — Rencana Umum Energi Nasional); Permen
ESDM 26/2021 (PLTS Atap, insentif energi terbarukan industri); ISO 50001.

**Formula:** `skor = clamp(% energi terbarukan aktual / 23 × 100, 0, 100)`

**Benchmark 23%:** Target bauran energi terbarukan nasional 2030, Perpres No.
22/2017 (RUEN) & PP 79/2014 (KEN). ✅ Tervalidasi sebagai anchor kebijakan.

**Intensitas energi** (kWh/ton output): dilaporkan di `detail` untuk referensi
klien tetapi tidak memengaruhi skor — belum ada benchmark intensitas lintas
industri yang dapat divalidasi secara publik.

---

### E4 — Penggunaan Bahan Baku (GRI 301)
**Regulasi:** UU No. 3/2014 tentang Perindustrian (Industri Hijau, Pasal 77-83);
Permen Perindustrian No. 51/2015 (Mekanisme sertifikasi industri hijau).

**Formula:** `skor = % bahan baku daur ulang` (linear 0–100)

⚠️ **DRAFT**: Tidak ada benchmark nasional/sektoral recycled content yang
ditemukan di regulasi maupun literatur Indonesia. Formula linear dipakai
sebagai pendekatan insentif: semakin tinggi daur ulang, semakin baik.
Industri Hijau (UU 3/2014) mendorong efisiensi material tetapi tidak
menetapkan target % recycled content yang berlaku umum.

---

### E5 — Polusi Udara & Lingkungan (GRI 305)
**Regulasi:** PP 22/2021 (baku mutu lingkungan hidup, termasuk air & udara);
PermenLHK No. P.15/2019 (baku mutu emisi sumber tidak bergerak industri);
PermenLHK No. 12/2025 (baku mutu air limbah industri tekstil dan pengolahan air).

**Formula:** `skor = rata-rata(skor_pemantauan_emisi, skor_kepatuhan_baku_mutu)`

Rubrik pemantauan emisi (maturity):
- Belum ada → 0 | Sebagian → 50 | Lengkap & terdokumentasi → 100

Rubrik kepatuhan baku mutu udara (yes/no):
- Ya (memenuhi) → 100 | Tidak → 0

Catatan: PermenLHK 12/2025 menetapkan baku mutu air limbah untuk sektor
tekstil; sektor lain merujuk PermenLHK P.5/2014 (berbasis jenis industri).

---

## Pilar S — Sosial (Social)

### S1 — Keselamatan & Kesehatan Kerja (GRI 403)
**Regulasi:** UU No. 13/2003 Pasal 86-87 (kewajiban K3 setiap perusahaan); PP
50/2012 tentang Penerapan SMK3 (wajib ≥100 karyawan atau risiko tinggi); Permenaker
No. 5/2018 (NAB faktor fisika, kimia, biologi); ISO 45001:2018.

**Formula:**
```
LTIFR = (jumlah_kecelakaan / total_jam_kerja) × 1.000.000
skor_LTIFR = 100 − clamp(LTIFR / 20 × 100, 0, 100)
skor_SMK3  = maturity SMK3 (0/50/100)
skor_S1    = rata-rata(skor_SMK3, skor_LTIFR)  -- jika jam kerja dilaporkan
           = skor_SMK3                           -- jika jam kerja = 0
```

**Threshold LTIFR WORST = 20** (⚠️ DRAFT — referensi industri manufaktur global
berkisar 2–10; angka 20 dipilih konservatif agar tidak terlalu menghukum UKM
yang baru mulai melaporkan). Sesuaikan per sektor jika data BPJS Ketenagakerjaan
tersedia.

---

### S2 — Hak-hak Tenaga Kerja (GRI 408/409)
**Regulasi:** UU No. 13/2003 (larangan pekerja anak Psl 68-75, upah minimum
Psl 88-90, kebebasan berserikat Psl 104); Permenaker No. 16/2015 (PHK); POJK
51/2017 (pengungkapan ketenagakerjaan dalam laporan keberlanjutan).

**Formula:** `skor = rata-rata(bebas_pekerja_anak, kebebasan_berserikat, patuh_UMK)`

Semua indikator yes/no (Ya=100, Tidak=0). Tiga indikator ini merepresentasikan
standar minimum ILO Core Labour Standards yang teradopsi dalam UU 13/2003. ✅

---

### S3 — Diversitas & Inklusi (GRI 405)
**Regulasi:** UU No. 40/2007 Pasal 74 (TJSL); POJK 51/2017 Lampiran II
(pengungkapan ketenagakerjaan & gender); Permen PPPA No. 3/2021 (pemberdayaan
perempuan di tempat kerja).

**Formula:** `skor = rata-rata(% perempuan di total tenaga kerja, % perempuan di manajemen)`

📋 Catatan: ILO menargetkan paritas gender 50%; rata-rata Indonesia 2023 sekitar
38% keterlibatan perempuan di angkatan kerja formal (BPS 2023). Formula linear
tidak menerapkan target eksplisit — semakin tinggi semakin baik. Pertimbangkan
menambah target 30% di manajemen (GRI 405-1 best practice) pada iterasi berikut.

---

### S4 — Dampak terhadap Masyarakat (GRI 413)
**Regulasi:** UU No. 40/2007 Pasal 74 (kewajiban CSR/TJSL bagi PT); PP 47/2012
(pelaksanaan TJSL); POJK 51/2017 (pengungkapan program kemasyarakatan).

**Formula:** `skor = rata-rata(skor_program_komunitas, skor_mekanisme_pengaduan)`

Rubrik program komunitas (maturity): Belum ada → 0 | Sebagian → 50 | Lengkap → 100
Rubrik mekanisme pengaduan (yes/no): Ya → 100 | Tidak → 0 ✅

---

### S5 — Kepuasan Pelanggan (GRI 417)
**Regulasi:** UU No. 8/1999 tentang Perlindungan Konsumen (kewajiban layanan &
informasi produk); POJK 51/2017 (pengungkapan hubungan pelanggan).

**Formula:** `skor = rata-rata(% kepuasan pelanggan, skor_sistem_keluhan)`

📋 Benchmark kepuasan: tidak ada standar nasional — % aktual dilaporkan langsung
(0–100). Rubrik sistem keluhan: Belum ada → 0 | Sebagian → 50 | Lengkap → 100.

---

## Pilar G — Tata Kelola (Governance)

### G1 — Struktur & Etika Bisnis (GRI 2-06)
**Regulasi:** UU No. 40/2007 Pasal 108 (kewajiban Dewan Komisaris Independen
pada perusahaan tertentu); POJK 33/2014 (Direksi & Komisaris Emiten); POJK
51/2017 (pengungkapan tata kelola dalam laporan keberlanjutan).

**Formula:** `skor = rata-rata(skor_kode_etik, skor_komisaris_independen)`

Rubrik kode etik (maturity): Belum ada → 0 | Sebagian → 50 | Lengkap → 100
Rubrik komisaris independen (yes/no): Ya → 100 | Tidak → 0

Catatan GRI: GRI 2-06 (GRI Universal Standards 2021) menggantikan GRI 102-22/23
untuk pengungkapan peran dan komposisi badan tata kelola. ✅

---

### G2 — Anti-Korupsi (GRI 205)
**Regulasi:** UU No. 31/1999 jo. UU No. 20/2001 tentang Pemberantasan Tindak
Pidana Korupsi; POJK 51/2017 (pengungkapan anti-korupsi & suap); Permen BUMN
PER-01/MBU/2011 (GCG BUMN, dijadikan referensi best-practice untuk swasta).

**Formula:** `skor = rata-rata(skor_kebijakan_antikorupsi, % karyawan terlatih antikorupsi)`

Rubrik kebijakan (maturity): Belum ada → 0 | Sebagian → 50 | Lengkap → 100
% pelatihan: 0–100 langsung. ✅

---

### G3 — Kepatuhan Hukum (GRI 206)
**Regulasi:** POJK 51/2017 (kewajiban pelaporan kepatuhan hukum dan sanksi
material); OJK GCG Guidelines (2014); UU No. 40/2007 Pasal 68 (kewajiban
laporan tahunan mencakup kepatuhan).

**Formula:**
```
skor_pelanggaran = 100 − clamp(jumlah_pelanggaran / 5 × 100, 0, 100)
skor_G3 = rata-rata(skor_pelanggaran, skor_sistem_kepatuhan)
```
Threshold WORST = 5 pelanggaran (⚠️ DRAFT — tidak ada standar absolut; 5 dipilih
sebagai batas yang masuk akal untuk UKM menengah). 0 pelanggaran = ideal.

---

### G4 — Manajemen Risiko (GRI 201)
**Regulasi:** POJK 51/2017 (pengungkapan manajemen risiko & iklim); OJK
Roadmap Keuangan Berkelanjutan 2015–2019 (wajib risk assessment iklim untuk
emiten); ISO 31000:2018 (kerangka manajemen risiko internasional).

**Formula:** `skor = rata-rata(skor_sistem_manajemen_risiko, skor_penilaian_risiko_iklim)`

Rubrik sistem risiko (maturity): Belum ada → 0 | Sebagian → 50 | Lengkap → 100
Rubrik risiko iklim (yes/no): Ya → 100 | Tidak → 0

Catatan: TCFD (Task Force on Climate-related Financial Disclosures) menjadi
referensi voluntary yang makin diadopsi emiten IDX; penilaian risiko iklim
(yes/no) adalah langkah minimum menuju TCFD alignment. ✅

---

## Tabel Status Lengkap

| Elemen | Formula | Anchor Utama | Status |
|---|---|---|---|
| E1 faktor emisi | konversi kgCO2e | ESDM/IESR, DEFRA, IPCC 2006 | ✅ Tervalidasi |
| E1 skor intensitas | tCO2e/ton output | GRI 305-4, PP 98/2021 | ✅ Tervalidasi (metodologi) |
| E1 threshold intensitas | 0.5–5.0 | Benchmarking lintas industri | ⚠️ DRAFT per-sektor |
| E1 fallback absolut | 50–1000 tCO2e | — | ⚠️ DRAFT UKM, tidak lintas-skala |
| E2 daur ulang | relatif ke 70% | Jakstranas, Perpres 97/2017 | 📋 Proxy kebijakan nasional |
| E2 B3 | yes/no | PP 101/2014 | ✅ Tervalidasi |
| E3 renewable share | relatif ke 23% | RUEN, Perpres 22/2017 | ✅ Tervalidasi |
| E3 intensitas energi | dilaporkan saja | — | 📋 Informatif, belum discoring |
| E4 recycled material | linear 0–100 | UU 3/2014 (prinsip) | ⚠️ DRAFT, belum ada target % |
| E5 pemantauan & kepatuhan | maturity/yes-no | PP 22/2021, PermenLHK P.15/2019 | ✅ Tervalidasi |
| S1 LTIFR | per 1jt jam kerja | UU 13/2003, PP 50/2012 | 📋 Threshold DRAFT |
| S1 SMK3 | maturity | PP 50/2012, ISO 45001 | ✅ Tervalidasi |
| S2 hak dasar | yes/no × 3 | UU 13/2003, ILO Core Standards | ✅ Tervalidasi |
| S3 gender % | linear | POJK 51/2017, GRI 405-1 | 📋 Tanpa target eksplisit |
| S4 komunitas & pengaduan | maturity/yes-no | UU 40/2007 Psl 74, PP 47/2012 | ✅ Tervalidasi |
| S5 kepuasan & keluhan | %/maturity | UU 8/1999, POJK 51/2017 | 📋 Tanpa benchmark |
| G1 kode etik & komisaris | maturity/yes-no | POJK 33/2014, UU 40/2007 | ✅ Tervalidasi |
| G2 anti-korupsi | maturity + % | UU 31/1999, POJK 51/2017 | ✅ Tervalidasi |
| G3 kepatuhan hukum | band + maturity | POJK 51/2017, OJK GCG | ⚠️ Threshold DRAFT |
| G4 manajemen risiko | maturity/yes-no | POJK 51/2017, ISO 31000 | ✅ Tervalidasi |

---

## Prioritas Validasi Berikutnya

1. **E1 threshold per-sektor** — Minta data intensitas emisi sektoral dari
   KLHK atau IDX ESG Survey untuk menetapkan BEST/WORST per jenis industri
   (semen, tekstil, pengolahan air, makanan & minuman).
2. **E4 recycled content target** — Cari regulasi sektoral Kemenperin yang
   mungkin menetapkan target konten daur ulang spesifik (misalnya untuk produk
   kemasan atau baja).
3. **S1 LTIFR WORST threshold** — Validasi dengan data kecelakaan kerja BPJS
   Ketenagakerjaan per sektor industri untuk menentukan threshold yang realistis
   untuk UKM Indonesia.
4. **S3 target gender** — Pertimbangkan menambahkan target 30% perempuan di
   posisi manajemen sesuai GRI 405-1 best practice.

*Terakhir diperbarui: 2026-06-29.*
