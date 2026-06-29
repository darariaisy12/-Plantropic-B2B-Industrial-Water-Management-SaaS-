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

**Formula skor — urutan prioritas:**
```
1. Sektor + output diketahui → benchmark intensitas per-sektor (paling akurat)
2. Output diketahui, tanpa sektor → benchmark intensitas lintas-sektor (default)
3. Output tidak dilaporkan → fallback absolut tCO2e (DRAFT)
```

**Benchmark intensitas per-sektor** (tCO2e/ton output) — ✅ Tervalidasi per IEA 2023:
| Sektor | Best (→100) | Worst (→0) |
|---|---|---|
| Semen & Material Bangunan | 0.4 | 1.0 |
| Tekstil & Garmen | 0.5 | 3.0 |
| Makanan & Minuman | 0.1 | 1.5 |
| Pulp & Kertas | 0.3 | 1.5 |
| Baja & Logam | 0.5 | 3.0 |
| Kimia & Petrokimia | 0.5 | 4.0 |
| Otomotif & Perakitan | 0.1 | 1.5 |
| Pengolahan Air & Limbah | 0.0003 | 0.002 (tCO2e/m³) |
| Pertambangan | 0.5 | 5.0 |

**Benchmark lintas-sektor default:** ≤0.5 → 100, ≥5.0 → 0 (⚠️ DRAFT)

**Fallback absolut** (⚠️ DRAFT — jika output produksi tidak dilaporkan):
```
skor = 100 − clamp((total tCO2e − 50) / (1000 − 50) × 100, 0, 100)
```

**Literatur Akademik:**
- Arvidsson, S. & Dumay, J. (2021). Corporate ESG reporting quantity, quality and performance. *Business Strategy and the Environment*, 31(3). doi:[10.1002/bse.2937](https://doi.org/10.1002/bse.2937) — pelaporan intensitas emisi lebih informatif daripada angka absolut.
- Nuskiya, M.N.F. et al. (2021). Determinants of corporate environmental disclosures in Sri Lanka. *Journal of Accounting in Emerging Economies*, 11(5). doi:[10.1108/jaee-02-2020-0028](https://doi.org/10.1108/jaee-02-2020-0028) — relevan untuk konteks negara berkembang seperti Indonesia.
- GHG Protocol Corporate Standard (WRI & WBCSD, 2004) — metodologi Scope 1+2 yang menjadi dasar framework ini.

---

### E2 — Pengelolaan Limbah Padat (GRI 306)
**Regulasi:** PP 22/2021 tentang Penyelenggaraan Perlindungan dan Pengelolaan
Lingkungan Hidup; Perpres 97/2017 (Jakstranas Sampah); PP 101/2014 (Limbah B3).

**Formula:** `skor = rata-rata(skor_daur_ulang, skor_B3)`

- `skor_daur_ulang = clamp(tingkat_daur_ulang_pct / 70 × 100, 0, 100)`
- `skor_B3 = Ya → 100 | Tidak → 0`

**Benchmark 70%:** Target nasional Jakstranas 2025 — "70% sampah tertangani"
(Perpres No. 97/2017). 📋 Catatan: Jakstranas menargetkan sampah perkotaan,
bukan limbah industri; dipakai sebagai anchor kebijakan nasional terbaik.

**Komponen B3** (kualitatif): Apakah limbah B3 dikelola pihak berizin?
- Basis: PP 101/2014 Pasal 4 — wajib menyerahkan ke pengumpul/pengolah berizin KLHK. ✅

**Literatur Akademik:**
- Shahab, Y. et al. (2022). Do corporate governance mechanisms curb anti-environmental behavior worldwide? *Journal of Environmental Management*, 316. doi:[10.1016/j.jenvman.2022.114707](https://doi.org/10.1016/j.jenvman.2022.114707) — tata kelola yang kuat mendorong praktik pengelolaan limbah yang bertanggung jawab.
- Opferkuch, K. et al. (2021). Circular economy in corporate sustainability reporting. *Business Strategy and the Environment*, 30(8). doi:[10.1002/bse.2854](https://doi.org/10.1002/bse.2854) — framework circular economy untuk pelaporan limbah korporat.
- Nur, A.C. & Nur, A.I. (2025). Enhancing Hazardous Waste Management Through 'SIPENGOLAH LIMBAH B3'. *International Journal of Public Administration in the Digital Age*. doi:[10.4018/ijpada.368716](https://doi.org/10.4018/ijpada.368716) — studi konteks Indonesia untuk pengelolaan B3.

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

**Literatur Akademik:**
- Ahmad, H., Yaqub, M. & Lee, S.H. (2023). ESG-related factors for business investment and sustainability. *Environment, Development and Sustainability*, 26. doi:[10.1007/s10668-023-02921-x](https://doi.org/10.1007/s10668-023-02921-x) — analisis faktor ESG yang mempengaruhi investasi bisnis berkelanjutan.
- Chen, S., Song, Y. & Gao, P. (2023). ESG Performance and Financial Outcomes. *Journal of Environmental Management*, 345. doi:[10.1016/j.jenvman.2023.118829](https://doi.org/10.1016/j.jenvman.2023.118829) — skor energi terbarukan berkorelasi positif dengan kinerja keuangan jangka panjang.
- ISO 50001:2018 — Standar internasional Sistem Manajemen Energi sebagai kerangka operasional. ✅

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

**Literatur Akademik:**
- Kirchherr, J. et al. (2023). Conceptualizing the Circular Economy: An Analysis of 221 Definitions. *Resources, Conservation and Recycling*, 194. doi:[10.1016/j.resconrec.2023.107001](https://doi.org/10.1016/j.resconrec.2023.107001) — fondasi konseptual circular economy yang mendasari metrik E4.
- Corvellec, H., Stowell, A. & Johansson, N. (2021). Critiques of the circular economy. *Journal of Industrial Ecology*, 26(2). doi:[10.1111/jiec.13187](https://doi.org/10.1111/jiec.13187) — mengakui keterbatasan pengukuran tunggal daur ulang tanpa benchmark sektoral.
- Dey, P.K. et al. (2020). Circular economy to enhance sustainability of SMEs. *Business Strategy and the Environment*, 29(6). doi:[10.1002/bse.2492](https://doi.org/10.1002/bse.2492) — relevan untuk klien UKM industri.

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

**Literatur Akademik:**
- Clementino, E. & Perkins, R. (2020). How Do Companies Respond to ESG ratings? *Journal of Business Ethics*, 171. doi:[10.1007/s10551-020-04441-4](https://doi.org/10.1007/s10551-020-04441-4) — kepatuhan baku mutu emisi adalah sinyal ESG kuat bagi investor institusi.
- Nuber, C. & Velte, P. (2021). Board gender diversity and carbon emissions. *Business Strategy and the Environment*, 30(6). doi:[10.1002/bse.2727](https://doi.org/10.1002/bse.2727) — korelasi antara kualitas tata kelola dan kualitas pengungkapan polusi.
- Luque-Vílchez, M. et al. (2023). Key aspects of sustainability reporting quality and the future of GRI. *Sustainability Accounting, Management and Policy Journal*, 14(7). doi:[10.1108/sampj-03-2023-0127](https://doi.org/10.1108/sampj-03-2023-0127) — relevansi GRI 305 untuk pengungkapan kualitas udara.

---

## Pilar S — Sosial (Social)

### S1 — Keselamatan & Kesehatan Kerja (GRI 403)
**Regulasi:** UU No. 13/2003 Pasal 86-87 (kewajiban K3 setiap perusahaan); PP
50/2012 tentang Penerapan SMK3 (wajib ≥100 karyawan atau risiko tinggi); Permenaker
No. 5/2018 (NAB faktor fisika, kimia, biologi); ISO 45001:2018.

**Formula:**
```
LTIFR = (jumlah_kecelakaan / total_jam_kerja) × 1.000.000
skor_LTIFR = 100 − clamp(LTIFR / 10 × 100, 0, 100)
skor_SMK3  = maturity SMK3 (0/50/100)
skor_S1    = rata-rata(skor_SMK3, skor_LTIFR)  -- jika jam kerja dilaporkan
           = skor_SMK3                           -- jika jam kerja = 0
```

**Threshold LTIFR WORST = 10** — ILO Occupational Safety Report (2023) menempatkan
rata-rata global manufaktur di 5–8 LTIFR; angka 10 dipilih sebagai batas
"risiko tinggi" yang konsisten dengan target zero-accident PP 50/2012 SMK3.
(Lebih ketat dari nilai sebelumnya 20, sesuai standar ILO 2023.) 📋

**Literatur Akademik:**
- Torres, L. et al. (2023). The potential of responsible business to promote sustainable work. *Safety Science*, 162. doi:[10.1016/j.ssci.2023.106151](https://doi.org/10.1016/j.ssci.2023.106151) — analisis CSR/ESG dan keselamatan kerja, mendukung LTIFR sebagai indikator utama.
- Fotiadis, S. et al. (2023). CSR Reports of Top UK Construction Companies: OHS Disclosures. *Sustainability*, 15(8). doi:[10.3390/su15086952](https://doi.org/10.3390/su15086952) — benchmark praktik pengungkapan K3 dalam laporan keberlanjutan.
- Santoso, B., Damayanti, C.R. & Utami, R.B. (2023). Analysing sustainability report using GRI for labour rights. *Journal of Governance and Regulation*, 12(4). doi:[10.22495/jgrv12i4art17](https://doi.org/10.22495/jgrv12i4art17) — studi GRI 403 dalam konteks Indonesia.

---

### S2 — Hak-hak Tenaga Kerja (GRI 408/409)
**Regulasi:** UU No. 13/2003 (larangan pekerja anak Psl 68-75, upah minimum
Psl 88-90, kebebasan berserikat Psl 104); Permenaker No. 16/2015 (PHK); POJK
51/2017 (pengungkapan ketenagakerjaan dalam laporan keberlanjutan).

**Formula:** `skor = rata-rata(bebas_pekerja_anak, kebebasan_berserikat, patuh_UMK)`

Semua indikator yes/no (Ya=100, Tidak=0). Tiga indikator ini merepresentasikan
standar minimum ILO Core Labour Standards yang teradopsi dalam UU 13/2003. ✅

**Literatur Akademik:**
- Santoso, B. et al. (2023). Analysing sustainability report using GRI for labour rights. *Journal of Governance and Regulation*, 12(4). doi:[10.22495/jgrv12i4art17](https://doi.org/10.22495/jgrv12i4art17) — validasi GRI 408/409 sebagai indikator hak kerja di Asia Tenggara.
- Torres, L. et al. (2023). Potential of responsible business to promote sustainable work. *Safety Science*, 162. doi:[10.1016/j.ssci.2023.106151](https://doi.org/10.1016/j.ssci.2023.106151) — keterkaitan antara CSR hak kerja dan kinerja sustainability.
- ILO Core Labour Standards (Konvensi ILO No. 87, 98, 138, 182, dan 29) — dasar hukum internasional untuk tiga indikator S2. ✅

---

### S3 — Diversitas & Inklusi (GRI 405)
**Regulasi:** UU No. 40/2007 Pasal 74 (TJSL); POJK 51/2017 Lampiran II
(pengungkapan ketenagakerjaan & gender); Permen PPPA No. 3/2021 (pemberdayaan
perempuan di tempat kerja).

**Formula:**
```
skor_workforce  = clamp(% perempuan / 38 × 100, 0, 100)
skor_management = clamp(% perempuan di manajemen / 30 × 100, 0, 100)
skor_S3         = rata-rata(skor_workforce, skor_management)
```

**Benchmark 38% tenaga kerja:** BPS (2023) Statistik Gender Tematik — tingkat
partisipasi perempuan di sektor formal Indonesia ≈38%. Mencapai angka ini
→ skor 100; melebihinya ditutup di 100 (tidak dihukum). ✅

**Benchmark 30% manajemen:** Target GRI 405-1 best practice dan rekomendasi
UN Women HeForShe — 30% perempuan di posisi senior/manajemen sebagai ambang
batas "critical mass" yang terbukti mendorong keberagaman perspektif. ✅

**Literatur Akademik:**
- Nicolò, G. et al. (2021). Sustainable corporate governance and non-financial disclosure: does gender diversity matter? *Journal of Applied Accounting Research*, 23(1). doi:[10.1108/jaar-04-2021-0100](https://doi.org/10.1108/jaar-04-2021-0100) — 30% perempuan di dewan signifikan meningkatkan kualitas pelaporan ESG.
- Nuber, C. & Velte, P. (2021). Board gender diversity and carbon emissions: curvilinear relationships and critical mass. *Business Strategy and the Environment*, 30(6). doi:[10.1002/bse.2727](https://doi.org/10.1002/bse.2727) — memvalidasi efek "critical mass" di atas 30% perempuan dalam manajemen.
- BPS (2023). Statistik Gender Tematik: Potret Perempuan Indonesia 2023. Jakarta: Badan Pusat Statistik — dasar empiris benchmark 38% tenaga kerja formal.

---

### S4 — Dampak terhadap Masyarakat (GRI 413)
**Regulasi:** UU No. 40/2007 Pasal 74 (kewajiban CSR/TJSL bagi PT); PP 47/2012
(pelaksanaan TJSL); POJK 51/2017 (pengungkapan program kemasyarakatan).

**Formula:** `skor = rata-rata(skor_program_komunitas, skor_mekanisme_pengaduan)`

Rubrik program komunitas (maturity): Belum ada → 0 | Sebagian → 50 | Lengkap → 100
Rubrik mekanisme pengaduan (yes/no): Ya → 100 | Tidak → 0 ✅

**Literatur Akademik:**
- Carrera, L. (2022). Corporate social responsibility: A strategy for social and territorial sustainability. *International Journal of Corporate Social Responsibility*, 7(1). doi:[10.1186/s40991-022-00074-0](https://doi.org/10.1186/s40991-022-00074-0) — framework CSR untuk dampak masyarakat yang mendasari rubrik S4.
- Yang, L., Ngai, C.S.B. & Lu, W. (2020). Changing trends of CSR reporting. *PLoS ONE*, 15(6). doi:[10.1371/journal.pone.0234258](https://doi.org/10.1371/journal.pone.0234258) — tren pelaporan program komunitas dan mekanisme keluhan.

---

### S5 — Kepuasan Pelanggan (GRI 417)
**Regulasi:** UU No. 8/1999 tentang Perlindungan Konsumen (kewajiban layanan &
informasi produk); POJK 51/2017 (pengungkapan hubungan pelanggan).

**Formula:** `skor = rata-rata(% kepuasan pelanggan, skor_sistem_keluhan)`

📋 Benchmark kepuasan: tidak ada standar nasional — % aktual dilaporkan langsung
(0–100). Rubrik sistem keluhan: Belum ada → 0 | Sebagian → 50 | Lengkap → 100.

**Literatur Akademik:**
- Alghamdi, O. & Agag, G. (2023). Voluntary Sustainability Reporting, Customer Behavior, and Firm Value. *Sustainability*, 15(21). doi:[10.3390/su152115584](https://doi.org/10.3390/su152115584) — kepuasan pelanggan yang dilaporkan berkorelasi dengan nilai perusahaan jangka panjang.
- Coelho, R., Jayantilal, S. & Ferreira, J.J. (2023). The impact of social responsibility on corporate financial performance. *Corporate Social Responsibility and Environmental Management*, 30(5). doi:[10.1002/csr.2446](https://doi.org/10.1002/csr.2446) — meta-analisis hubungan CSR pelanggan dan kinerja.

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

**Literatur Akademik:**
- Gerwing, T., Kajüter, P. & Wirth, M. (2022). The role of sustainable corporate governance in mandatory sustainability reporting quality. *Journal of Business Economics*, 92. doi:[10.1007/s11573-022-01092-x](https://doi.org/10.1007/s11573-022-01092-x) — kode etik yang kuat meningkatkan kualitas pelaporan ESG.
- Clementino, E. & Perkins, R. (2020). How Do Companies Respond to ESG ratings? *Journal of Business Ethics*, 171. doi:[10.1007/s10551-020-04441-4](https://doi.org/10.1007/s10551-020-04441-4) — hubungan antara struktur tata kelola dan respons perusahaan terhadap penilaian ESG.
- de Villiers, C. & Dimes, R. (2020). Determinants, mechanisms and consequences of corporate governance reporting. *Journal of Management & Governance*, 25. doi:[10.1007/s10997-020-09530-0](https://doi.org/10.1007/s10997-020-09530-0) — framework analisis pelaporan tata kelola.

---

### G2 — Anti-Korupsi (GRI 205)
**Regulasi:** UU No. 31/1999 jo. UU No. 20/2001 tentang Pemberantasan Tindak
Pidana Korupsi; POJK 51/2017 (pengungkapan anti-korupsi & suap); Permen BUMN
PER-01/MBU/2011 (GCG BUMN, dijadikan referensi best-practice untuk swasta).

**Formula:** `skor = rata-rata(skor_kebijakan_antikorupsi, % karyawan terlatih antikorupsi)`

Rubrik kebijakan (maturity): Belum ada → 0 | Sebagian → 50 | Lengkap → 100
% pelatihan: 0–100 langsung. ✅

**Literatur Akademik:**
- Ghazwani, M. et al. (2023). Anti-corruption disclosure and corporate governance mechanisms. *International Journal of Accounting and Information Management*, 32(1). doi:[10.1108/ijaim-08-2023-0211](https://doi.org/10.1108/ijaim-08-2023-0211) — pelatihan anti-korupsi berkorelasi dengan kualitas pengungkapan G2.
- Previtali, P. & Cerchiello, P. (2023). Corporate governance and anti-corruption disclosure. *Corporate Governance: The International Journal of Business in Society*, 24(1). doi:[10.1108/cg-06-2022-0275](https://doi.org/10.1108/cg-06-2022-0275) — kerangka tata kelola untuk pengungkapan anti-korupsi.

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

**Literatur Akademik:**
- Clementino, E. & Perkins, R. (2020). How Do Companies Respond to ESG ratings? *Journal of Business Ethics*, 171. doi:[10.1007/s10551-020-04441-4](https://doi.org/10.1007/s10551-020-04441-4) — riwayat pelanggaran hukum berpengaruh signifikan terhadap skor ESG keseluruhan.
- Gerged, A.M., Beddewela, E. & Cowton, C.J. (2021). Does country-level governance affect corporate environmental disclosure? *International Journal of Finance & Economics*, 27(2). doi:[10.1002/ijfe.2469](https://doi.org/10.1002/ijfe.2469) — keterkaitan antara kepatuhan hukum dan kualitas pengungkapan lingkungan.

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

**Literatur Akademik:**
- Hoepner, A.G.F. et al. (2023). ESG shareholder engagement and downside risk. *Review of Finance*, 28(2). doi:[10.1093/rof/rfad034](https://doi.org/10.1093/rof/rfad034) — sistem manajemen risiko yang kuat mengurangi downside risk secara signifikan.
- Oprean-Stan, C. et al. (2020). Impact of Sustainability Reporting and ESG Factors on Corporate Performance. *Sustainability*, 12(20). doi:[10.3390/su12208536](https://doi.org/10.3390/su12208536) — korelasi antara kualitas manajemen risiko dan pertumbuhan berkelanjutan.
- Berg, F., Kölbel, J.F. & Rigobón, R. (2022). Aggregate Confusion: The Divergence of ESG Ratings. *Review of Finance*, 26(6). doi:[10.1093/rof/rfac033](https://doi.org/10.1093/rof/rfac033) — pentingnya konsistensi pengukuran manajemen risiko untuk menghindari divergensi penilaian.

---

## Tabel Status Lengkap

| Elemen | Formula | Anchor Utama | Status |
|---|---|---|---|
| E1 faktor emisi | konversi kgCO2e | ESDM/IESR, DEFRA, IPCC 2006 | ✅ Tervalidasi |
| E1 skor per-sektor | intensitas vs benchmark sektoral | IEA Industry Data 2023 | ✅ Tervalidasi |
| E1 skor lintas-sektor | tCO2e/ton output, 0.5–5.0 | GRI 305-4, PP 98/2021 | ⚠️ DRAFT lintas-sektor |
| E1 fallback absolut | 50–1000 tCO2e | — | ⚠️ DRAFT UKM, tidak lintas-skala |
| E2 daur ulang | relatif ke 70% | Jakstranas, Perpres 97/2017 | 📋 Proxy kebijakan nasional |
| E2 B3 | yes/no | PP 101/2014 | ✅ Tervalidasi |
| E3 renewable share | relatif ke 23% | RUEN, Perpres 22/2017 | ✅ Tervalidasi |
| E3 intensitas energi | dilaporkan saja | — | 📋 Informatif, belum discoring |
| E4 recycled material | linear 0–100 | UU 3/2014 (prinsip) | ⚠️ DRAFT, belum ada target % |
| E5 pemantauan & kepatuhan | maturity/yes-no | PP 22/2021, PermenLHK P.15/2019 | ✅ Tervalidasi |
| S1 LTIFR | per 1jt jam kerja, worst=10 | ILO 2023, PP 50/2012 | 📋 Threshold DRAFT |
| S1 SMK3 | maturity | PP 50/2012, ISO 45001 | ✅ Tervalidasi |
| S2 hak dasar | yes/no × 3 | UU 13/2003, ILO Core Standards | ✅ Tervalidasi |
| S3 gender tenaga kerja | relatif ke 38% BPS | BPS 2023, POJK 51/2017 | ✅ Tervalidasi (benchmark empiris) |
| S3 gender manajemen | relatif ke 30% | GRI 405-1, UN Women, Nicolò et al. (2021) | ✅ Tervalidasi (best practice) |
| S4 komunitas & pengaduan | maturity/yes-no | UU 40/2007 Psl 74, PP 47/2012 | ✅ Tervalidasi |
| S5 kepuasan & keluhan | %/maturity | UU 8/1999, POJK 51/2017 | 📋 Tanpa benchmark |
| G1 kode etik & komisaris | maturity/yes-no | POJK 33/2014, UU 40/2007 | ✅ Tervalidasi |
| G2 anti-korupsi | maturity + % | UU 31/1999, POJK 51/2017 | ✅ Tervalidasi |
| G3 kepatuhan hukum | band + maturity | POJK 51/2017, OJK GCG | ⚠️ Threshold DRAFT |
| G4 manajemen risiko | maturity/yes-no | POJK 51/2017, ISO 31000 | ✅ Tervalidasi |

---

## Prioritas Validasi Berikutnya

1. **E4 recycled content target** — Cari regulasi sektoral Kemenperin yang
   mungkin menetapkan target konten daur ulang spesifik (misalnya produk kemasan atau baja).
2. **S1 LTIFR threshold per-sektor** — Validasi dengan data kecelakaan kerja BPJS
   Ketenagakerjaan per sektor industri untuk threshold yang realistis bagi UKM Indonesia.
3. **E1 benchmark air** — Validasi threshold pengolahan air (0.0003–0.002 tCO2e/m³)
   dengan data operasi PDAM atau BUMD air minum Indonesia.
4. **S5 benchmark kepuasan** — Pertimbangkan target NPS atau CSAT sektoral
   jika tersedia dari BPKN atau survei industri terkait.

---

## Referensi Lengkap (Seluruh Jurnal yang Dikutip)

> File PDF tersedia di folder `jurnal/<elemen>/` untuk verifikasi mandiri.

| Penulis | Tahun | Judul Singkat | Jurnal | DOI |
|---|---|---|---|---|
| Arvidsson & Dumay | 2021 | ESG reporting quality | *Business Strategy and the Environment* | [10.1002/bse.2937](https://doi.org/10.1002/bse.2937) |
| Nuskiya et al. | 2021 | Environmental disclosures Sri Lanka | *Journal of Accounting in Emerging Economies* | [10.1108/jaee-02-2020-0028](https://doi.org/10.1108/jaee-02-2020-0028) |
| Shahab et al. | 2022 | Governance & waste management | *Journal of Environmental Management* | [10.1016/j.jenvman.2022.114707](https://doi.org/10.1016/j.jenvman.2022.114707) |
| Opferkuch et al. | 2021 | Circular economy in reporting | *Business Strategy and the Environment* | [10.1002/bse.2854](https://doi.org/10.1002/bse.2854) |
| Nur & Nur | 2025 | B3 waste management Indonesia | *Int. Journal of Public Administration in the Digital Age* | [10.4018/ijpada.368716](https://doi.org/10.4018/ijpada.368716) |
| Ahmad et al. | 2023 | ESG factors for investment | *Environment, Development and Sustainability* | [10.1007/s10668-023-02921-x](https://doi.org/10.1007/s10668-023-02921-x) |
| Chen et al. | 2023 | ESG & financial outcomes | *Journal of Environmental Management* | [10.1016/j.jenvman.2023.118829](https://doi.org/10.1016/j.jenvman.2023.118829) |
| Kirchherr et al. | 2023 | Circular economy definitions | *Resources, Conservation and Recycling* | [10.1016/j.resconrec.2023.107001](https://doi.org/10.1016/j.resconrec.2023.107001) |
| Corvellec et al. | 2021 | Critiques of circular economy | *Journal of Industrial Ecology* | [10.1111/jiec.13187](https://doi.org/10.1111/jiec.13187) |
| Dey et al. | 2020 | Circular economy for SMEs | *Business Strategy and the Environment* | [10.1002/bse.2492](https://doi.org/10.1002/bse.2492) |
| Clementino & Perkins | 2020 | Companies respond to ESG ratings | *Journal of Business Ethics* | [10.1007/s10551-020-04441-4](https://doi.org/10.1007/s10551-020-04441-4) |
| Nuber & Velte | 2021 | Board gender diversity & emissions | *Business Strategy and the Environment* | [10.1002/bse.2727](https://doi.org/10.1002/bse.2727) |
| Luque-Vílchez et al. | 2023 | GRI reporting quality | *Sustainability Accounting, Management and Policy Journal* | [10.1108/sampj-03-2023-0127](https://doi.org/10.1108/sampj-03-2023-0127) |
| Torres et al. | 2023 | Responsible business & sustainable work | *Safety Science* | [10.1016/j.ssci.2023.106151](https://doi.org/10.1016/j.ssci.2023.106151) |
| Fotiadis et al. | 2023 | OHS disclosures in CSR reports | *Sustainability* | [10.3390/su15086952](https://doi.org/10.3390/su15086952) |
| Santoso et al. | 2023 | GRI for labour rights Indonesia | *Journal of Governance and Regulation* | [10.22495/jgrv12i4art17](https://doi.org/10.22495/jgrv12i4art17) |
| Nicolò et al. | 2021 | Gender diversity & ESG reporting | *Journal of Applied Accounting Research* | [10.1108/jaar-04-2021-0100](https://doi.org/10.1108/jaar-04-2021-0100) |
| Carrera | 2022 | CSR social sustainability | *International Journal of Corporate Social Responsibility* | [10.1186/s40991-022-00074-0](https://doi.org/10.1186/s40991-022-00074-0) |
| Yang et al. | 2020 | CSR reporting trends | *PLoS ONE* | [10.1371/journal.pone.0234258](https://doi.org/10.1371/journal.pone.0234258) |
| Alghamdi & Agag | 2023 | Sustainability reporting & customer | *Sustainability* | [10.3390/su152115584](https://doi.org/10.3390/su152115584) |
| Coelho et al. | 2023 | CSR & financial performance | *Corporate Social Responsibility and Environmental Management* | [10.1002/csr.2446](https://doi.org/10.1002/csr.2446) |
| Gerwing et al. | 2022 | Corporate governance & reporting | *Journal of Business Economics* | [10.1007/s11573-022-01092-x](https://doi.org/10.1007/s11573-022-01092-x) |
| de Villiers & Dimes | 2020 | Governance reporting framework | *Journal of Management & Governance* | [10.1007/s10997-020-09530-0](https://doi.org/10.1007/s10997-020-09530-0) |
| Ghazwani et al. | 2023 | Anti-corruption disclosure | *Int. Journal of Accounting and Information Management* | [10.1108/ijaim-08-2023-0211](https://doi.org/10.1108/ijaim-08-2023-0211) |
| Previtali & Cerchiello | 2023 | Corporate governance & anti-corruption | *Corporate Governance: The Int. Journal of Business in Society* | [10.1108/cg-06-2022-0275](https://doi.org/10.1108/cg-06-2022-0275) |
| Gerged et al. | 2021 | Country governance & ESG disclosure | *International Journal of Finance & Economics* | [10.1002/ijfe.2469](https://doi.org/10.1002/ijfe.2469) |
| Hoepner et al. | 2023 | ESG engagement & downside risk | *Review of Finance* | [10.1093/rof/rfad034](https://doi.org/10.1093/rof/rfad034) |
| Oprean-Stan et al. | 2020 | ESG & sustainable growth | *Sustainability* | [10.3390/su12208536](https://doi.org/10.3390/su12208536) |
| Berg et al. | 2022 | Divergence of ESG ratings | *Review of Finance* | [10.1093/rof/rfac033](https://doi.org/10.1093/rof/rfac033) |

*Terakhir diperbarui: 2026-06-29.*
