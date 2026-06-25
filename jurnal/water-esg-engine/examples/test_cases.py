#!/usr/bin/env python3
"""
TEST CASES — Water ESG Engine
==============================
8 Skenario pengujian berbagai industri & kondisi:
1. Pabrik Tekstil (limbah tinggi BOD)
2. Pabrik Makanan (limbah organik tinggi)
3. Hotel & Hospitality (limbah domestik)
4. Pabrik Kimia (limbah berbahaya)
5. Perkebunan Sawit (green WF tinggi)
6. Data Bersih (semua compliant)
7. Data Kritis (semua melanggar)
8. Edge Case (data minimal/hampir kosong)
"""

import sys
import os
from datetime import date

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from models.water_data import (
    DataAirMasuk, DataAirKeluar, DataAirHujan, DataDaurUlang,
    DataLimbahCair, SumberAir, TujuanPembuangan, KelasAirBaku,
    StatusKepatuhan
)
from calculators.water_footprint import WaterFootprintCalculator
from calculators.waste_load import WasteLoadCalculator
from calculators.compliance import ComplianceChecker
from reports.report_generator import ReportGenerator


def print_header(nama, emoji):
    print(f"\n{'='*70}")
    print(f"{emoji}  TEST CASE: {nama}")
    print(f"{'='*70}")


def print_section(judul):
    print(f"\n  {'─'*50}")
    print(f"  {judul}")
    print(f"  {'─'*50}")


# ============================================================
# TEST CASE 1: PABRIK TEKSTIL
# ============================================================
def test_case_1_pabrik_tekstil():
    print_header("Pabrik Tekstil — PT Maju Bersama", "🏭")

    calc = WaterFootprintCalculator()

    # Air masuk: banyak air untuk pencelupan & finishing
    calc.tambah_air_masuk_batch([
        DataAirMasuk(SumberAir.PDAM, 8000, 1, 2025, "Air proses pencelupan"),
        DataAirMasuk(SumberAir.TANAH, 4000, 1, 2025, "Air cooling tower"),
        DataAirMasuk(SumberAir.PERMUKAAN, 1000, 1, 2025, "Air sungai cadangan"),
    ])

    # Air keluar
    calc.tambah_air_keluar_batch([
        DataAirKeluar(TujuanPembuangan.BADAN_AIR, 6000, 1, 2025, True, "Buangan ke sungai"),
        DataAirKeluar(TujuanPembuangan.EVAPORASI, 3000, 1, 2025, False, "Cooling tower"),
    ])

    # Air hujan
    calc.tambah_air_hujan(DataAirHujan(300, 8000, 1, 2025, "Rainwater harvesting"))

    # Daur ulang
    calc.tambah_daur_ulang(DataDaurUlang(1500, "Flushing & siram tanaman", 1, 2025))

    # Limbah cair: tinggi BOD & warna (khas tekstil)
    limbah_data = [
        DataLimbahCair(date(2025, 1, 10), 200,
                       bod_mg_l=120, cod_mg_l=280, tss_mg_l=150,
                       ph=8.5, oil_grease_mg_l=10, ammonia_mg_l=12,
                       suhu_c=38, warna_tcu=350),
        DataLimbahCair(date(2025, 1, 20), 180,
                       bod_mg_l=95, cod_mg_l=220, tss_mg_l=130,
                       ph=7.8, oil_grease_mg_l=8, ammonia_mg_l=9,
                       suhu_c=35, warna_tcu=280),
    ]

    # Hitung
    hasil = calc.hitung(1, 2025)
    waste_calc = WasteLoadCalculator()
    beban_list = waste_calc.hitung_batch(limbah_data)
    checker = ComplianceChecker(KelasAirBaku.C)
    kepatuhan_list = checker.cek_batch(limbah_data)

    # Output
    print_section("Water Footprint")
    print(f"  Total Air Diambil  : {hasil.total_air_diambil_m3:>10,.0f} m³")
    print(f"  Blue WF            : {hasil.blue_wf_m3:>10,.0f} m³")
    print(f"  Green WF           : {hasil.green_wf_m3:>10,.0f} m³")
    print(f"  Grey WF            : {hasil.grey_wf_m3:>10,.0f} m³")
    print(f"  TOTAL WF           : {hasil.total_wf_m3:>10,.0f} m³")

    print_section("Beban Pencemaran (Rata-rata)")
    rata = waste_calc.hitung_rata_rata(limbah_data)
    for nama, detail in rata['rincian_parameter'].items():
        print(f"  {nama}: {detail['rata_rata_konsentrasi']:>8.1f} mg/L → "
              f"{detail['rata_rata_kg_per_hari']:>8.2f} kg/hari")

    print_section("Kepatuhan Baku Mutu Kelas C")
    for i, k in enumerate(kepatuhan_list):
        icon = "✅" if k.status_keseluruhan == StatusKepatuhan.COMPLIANT else "❌"
        print(f"  Pengujian #{i+1}: {icon} {k.status_keseluruhan.value.upper()}")
        for p in k.parameter_list:
            pi = {"compliant": "✅", "non_compliant": "❌", "warning": "⚡"}
            print(f"    {pi.get(p.status.value, '?')} {p.nama_parameter}: "
                  f"{p.nilai_aktual} / {p.nilai_baku_mutu} = {p.rasio:.0f}%")

    return calc, limbah_data


# ============================================================
# TEST CASE 2: PABRIK MAKANAN
# ============================================================
def test_case_2_pabrik_makanan():
    print_header("Pabrik Makanan — PT Sari Rasa", "🍕")

    calc = WaterFootprintCalculator()

    # Air masuk: banyak air untuk pencucian & produksi
    calc.tambah_air_masuk_batch([
        DataAirMasuk(SumberAir.PDAM, 12000, 1, 2025, "Air produksi & pencucian"),
        DataAirMasuk(SumberAir.TANAH, 3000, 1, 2025, "Air boiler"),
    ])

    # Air keluar
    calc.tambah_air_keluar_batch([
        DataAirKeluar(TujuanPembuangan.BADAN_AIR, 8000, 1, 2025, True, "IPAL → sungai"),
        DataAirKeluar(TujuanPembuangan.EVAPORASI, 2000, 1, 2025, False, "Boiler & cooling"),
    ])

    # Limbah: organik tinggi (BOD & COD tinggi)
    limbah_data = [
        DataLimbahCair(date(2025, 1, 5), 300,
                       bod_mg_l=200, cod_mg_l=450, tss_mg_l=250,
                       ph=6.5, ammonia_mg_l=25, suhu_c=30),
        DataLimbahCair(date(2025, 1, 15), 280,
                       bod_mg_l=180, cod_mg_l=400, tss_mg_l=220,
                       ph=6.8, ammonia_mg_l=20, suhu_c=32),
        DataLimbahCair(date(2025, 1, 25), 320,
                       bod_mg_l=250, cod_mg_l=500, tss_mg_l=300,
                       ph=6.2, ammonia_mg_l=30, suhu_c=34),
    ]

    hasil = calc.hitung(1, 2025)
    waste_calc = WasteLoadCalculator()
    checker = ComplianceChecker(KelasAirBaku.C)

    print_section("Water Footprint")
    print(f"  Blue WF : {hasil.blue_wf_m3:>10,.0f} m³")
    print(f"  Grey WF : {hasil.grey_wf_m3:>10,.0f} m³")
    print(f"  TOTAL   : {hasil.total_wf_m3:>10,.0f} m³")

    print_section("Beban Pencemaran")
    rata = waste_calc.hitung_rata_rata(limbah_data)
    for nama, detail in rata['rincian_parameter'].items():
        print(f"  {nama}: rata-rata {detail['rata_rata_konsentrasi']:.0f} mg/L "
              f"(min: {detail['min_konsentrasi']}, max: {detail['max_konsentrasi']})")

    print_section("Kepatuhan")
    kepatuhan_list = checker.cek_batch(limbah_data)
    for i, k in enumerate(kepatuhan_list):
        print(f"  #{i+1}: {k.status_keseluruhan.value.upper()} "
              f"(C:{k.jumlah_compliant} W:{k.jumlah_warning} NC:{k.jumlah_non_compliant})")

    return calc, limbah_data


# ============================================================
# TEST CASE 3: HOTEL
# ============================================================
def test_case_3_hotel():
    print_header("Hotel Bintang 4 — Grand Sejahtera", "🏨")

    calc = WaterFootprintCalculator()

    # Hotel: air domestik (PDAM saja)
    calc.tambah_air_masuk_batch([
        DataAirMasuk(SumberAir.PDAM, 15000, 1, 2025, "Air kamar, laundry, kolam"),
        DataAirMasuk(SumberAir.TANAH, 2000, 1, 2025, "Air taman & toilet"),
    ])

    calc.tambah_air_keluar_batch([
        DataAirKeluar(TujuanPembuangan.PENGOLAHAN_PIHAK_KETIGA, 12000, 1, 2025, True, "Ke IPAL kota"),
        DataAirKeluar(TujuanPembuangan.EVAPORASI, 1000, 1, 2025, False, "Kolam renang"),
    ])

    # Limbah domestik: BOD & TSS relatif rendah
    limbah_data = [
        DataLimbahCair(date(2025, 1, 15), 400,
                       bod_mg_l=35, cod_mg_l=80, tss_mg_l=45,
                       ph=7.0, ammonia_mg_l=8, deterjen_mg_l=3),
    ]

    hasil = calc.hitung(1, 2025)
    waste_calc = WasteLoadCalculator()
    checker = ComplianceChecker(KelasAirBaku.B)  # Kelas B untuk domestik

    print_section("Water Footprint")
    print(f"  Blue WF : {hasil.blue_wf_m3:>10,.0f} m³")
    print(f"  TOTAL   : {hasil.total_wf_m3:>10,.0f} m³")
    print(f"  Intensitas per kamar (150 kamar): {hasil.total_wf_m3/150:,.0f} m³/kamar")

    print_section("Kepatuhan Kelas B")
    k = checker.cek(limbah_data[0])
    print(f"  Status: {k.status_keseluruhan.value.upper()}")
    for p in k.parameter_list:
        pi = {"compliant": "✅", "non_compliant": "❌", "warning": "⚡"}
        print(f"    {pi.get(p.status.value, '?')} {p.nama_parameter}: "
              f"{p.nilai_aktual} / {p.nilai_baku_mutu}")

    return calc, limbah_data


# ============================================================
# TEST CASE 4: PABRIK KIMIA
# ============================================================
def test_case_4_pabrik_kimia():
    print_header("Pabrik Kimia — PT Chemindo Jaya", "⚗️")

    calc = WaterFootprintCalculator()

    calc.tambah_air_masuk_batch([
        DataAirMasuk(SumberAir.PDAM, 5000, 1, 2025),
        DataAirMasuk(SumberAir.TANAH, 6000, 1, 2025, "Air proses kimia"),
    ])

    calc.tambah_air_keluar_batch([
        DataAirKeluar(TujuanPembuangan.BADAN_AIR, 4000, 1, 2025, True),
        DataAirKeluar(TujuanPembuangan.EVAPORASI, 2000, 1, 2025, False),
    ])

    # Limbah: pH ekstrem, COD tinggi, O&G tinggi
    limbah_data = [
        DataLimbahCair(date(2025, 1, 10), 150,
                       bod_mg_l=60, cod_mg_l=350, tss_mg_l=180,
                       ph=4.2, oil_grease_mg_l=25, ammonia_mg_l=18,
                       suhu_c=42),
        DataLimbahCair(date(2025, 1, 20), 140,
                       bod_mg_l=55, cod_mg_l=320, tss_mg_l=160,
                       ph=10.5, oil_grease_mg_l=22, ammonia_mg_l=15,
                       suhu_c=40),
    ]

    hasil = calc.hitung(1, 2025)
    checker = ComplianceChecker(KelasAirBaku.C)
    kepatuhan_list = checker.cek_batch(limbah_data)

    print_section("Water Footprint")
    print(f"  Blue WF : {hasil.blue_wf_m3:>10,.0f} m³")
    print(f"  Grey WF : {hasil.grey_wf_m3:>10,.0f} m³")
    print(f"  TOTAL   : {hasil.total_wf_m3:>10,.0f} m³")

    print_section("Kepatuhan — PERHATIAN!")
    for i, k in enumerate(kepatuhan_list):
        print(f"  Pengujian #{i+1}: {k.status_keseluruhan.value.upper()}")
        for p in k.parameter_list:
            if p.status != StatusKepatuhan.COMPLIANT:
                pi = {"non_compliant": "❌", "warning": "⚡"}
                print(f"    {pi.get(p.status.value, '?')} {p.nama_parameter}: "
                      f"{p.nilai_aktual} (batas: {p.nilai_baku_mutu}) — {p.keterangan}")

    return calc, limbah_data


# ============================================================
# TEST CASE 5: PERKEBUNAN SAWIT
# ============================================================
def test_case_5_perkebunan_sawit():
    print_header("Perkebunan Sawit — PT Sawit Makmur", "🌴")

    calc = WaterFootprintCalculator()

    # Green WF tinggi (air hujan untuk irigasi)
    calc.tambah_air_masuk_batch([
        DataAirMasuk(SumberAir.PDAM, 1000, 1, 2025, "Air operasional"),
        DataAirMasuk(SumberAir.TANAH, 500, 1, 2025, "Air sumur"),
        DataAirMasuk(SumberAir.PERMUKAAN, 3000, 1, 2025, "Air sungai irigasi"),
    ])

    calc.tambah_air_keluar_batch([
        DataAirKeluar(TujuanPembuangan.BADAN_AIR, 2000, 1, 2025, True),
        DataAirKeluar(TujuanPembuangan.IRIGASI, 1500, 1, 2025, False, "Irigrasi kembali"),
    ])

    # Air hujan dimanfaatkan
    calc.tambah_air_hujan(DataAirHujan(5000, 50000, 1, 2025, "Irigrasi kebun"))

    # Limbah: POME (Palm Oil Mill Effluent) — sangat tinggi BOD
    limbah_data = [
        DataLimbahCair(date(2025, 1, 15), 500,
                       bod_mg_l=1500, cod_mg_l=3000, tss_mg_l=2000,
                       ph=4.5, ammonia_mg_l=50, suhu_c=45),
    ]

    hasil = calc.hitung(1, 2025)

    print_section("Water Footprint")
    print(f"  Blue WF  : {hasil.blue_wf_m3:>10,.0f} m³")
    print(f"  Green WF : {hasil.green_wf_m3:>10,.0f} m³  ← dominan!")
    print(f"  Grey WF  : {hasil.grey_wf_m3:>10,.0f} m³  ← POME sangat tinggi")
    print(f"  TOTAL    : {hasil.total_wf_m3:>10,.0f} m³")

    print_section("POME — Limbah Paling Berat!")
    waste_calc = WasteLoadCalculator()
    beban = waste_calc.hitung(limbah_data[0])
    for nama, detail in beban.rincian.items():
        print(f"  {nama}: {detail['konsentrasi_mg_l']:>8,.0f} mg/L → "
              f"{detail['beban_kg_per_hari']:>10,.2f} kg/hari "
              f"({detail['beban_ton_per_tahun']:>8,.1f} ton/tahun)")

    return calc, limbah_data


# ============================================================
# TEST CASE 6: DATA BERSIH (SEMUA COMPLIANT)
# ============================================================
def test_case_6_data_bersih():
    print_header("Data Bersih — Semua Parameter Sesuai Baku Mutu", "✅")

    limbah_data = [
        DataLimbahCair(date(2025, 1, 15), 100,
                       bod_mg_l=20, cod_mg_l=50, tss_mg_l=30,
                       ph=7.2, oil_grease_mg_l=3, ammonia_mg_l=2,
                       suhu_c=28),
        DataLimbahCair(date(2025, 2, 15), 100,
                       bod_mg_l=18, cod_mg_l=45, tss_mg_l=25,
                       ph=7.0, oil_grease_mg_l=2, ammonia_mg_l=1.5,
                       suhu_c=27),
        DataLimbahCair(date(2025, 3, 15), 100,
                       bod_mg_l=22, cod_mg_l=55, tss_mg_l=35,
                       ph=7.5, oil_grease_mg_l=4, ammonia_mg_l=3,
                       suhu_c=29),
    ]

    checker = ComplianceChecker(KelasAirBaku.C)
    kepatuhan_list = checker.cek_batch(limbah_data)

    print_section("Hasil Kepatuhan")
    all_compliant = True
    for i, k in enumerate(kepatuhan_list):
        if k.status_keseluruhan != StatusKepatuhan.COMPLIANT:
            all_compliant = False
        print(f"  Pengujian #{i+1}: {k.status_keseluruhan.value.upper()} "
              f"(C:{k.jumlah_compliant} W:{k.jumlah_warning} NC:{k.jumlah_non_compliant})")

    print_section("Ringkasan Komprehensif")
    ringkasan = checker.ringkasan_komprehensif(limbah_data)
    print(f"  Total Pengujian    : {ringkasan['jumlah_pengujian']}")
    print(f"  % Kepatuhan        : {ringkasan['keseluruhan']['persentase_kepatuhan']}%")
    for r in ringkasan['rekomendasi']:
        print(f"  {r}")

    if all_compliant:
        print("\n  ✅ SEMUA DATA COMPLIANT — Contoh ideal!")
    else:
        print("\n  ❌ Ada yang tidak compliant — perlu perbaikan!")

    return limbah_data


# ============================================================
# TEST CASE 7: DATA KRITIS (SEMUA MELANGGAR)
# ============================================================
def test_case_7_data_kritis():
    print_header("Data Kritis — Semua Parameter Melampaui Batas", "🚨")

    limbah_data = [
        DataLimbahCair(date(2025, 1, 15), 200,
                       bod_mg_l=300, cod_mg_l=600, tss_mg_l=500,
                       ph=3.5, oil_grease_mg_l=30, ammonia_mg_l=25,
                       suhu_c=48),
    ]

    checker = ComplianceChecker(KelasAirBaku.C)
    k = checker.cek(limbah_data[0])

    print_section("Hasil Kepatuhan")
    print(f"  Status: ❌ {k.status_keseluruhan.value.upper()}")
    print(f"  Compliant: {k.jumlah_compliant}")
    print(f"  Warning: {k.jumlah_warning}")
    print(f"  Non-Compliant: {k.jumlah_non_compliant}")

    print_section("Parameter Bermasalah")
    for p in k.parameter_list:
        if p.status == StatusKepatuhan.NON_COMPLIANT:
            print(f"  ❌ {p.nama_parameter}: {p.nilai_aktual} / {p.nilai_baku_mutu} "
                  f"= {p.rasio:.0f}% — {p.keterangan}")

    print_section("Beban Pencemaran")
    waste_calc = WasteLoadCalculator()
    beban = waste_calc.hitung(limbah_data[0])
    for nama, detail in beban.rincian.items():
        print(f"  {nama}: {detail['beban_kg_per_hari']:.2f} kg/hari "
              f"({detail['beban_ton_per_tahun']:.1f} ton/tahun)")

    print("\n  🚨 PERLU TINDAKAN SEGERA: Upgrade IPAL!")

    return limbah_data


# ============================================================
# TEST CASE 8: EDGE CASE (DATA MINIMAL)
# ============================================================
def test_case_8_edge_case():
    print_header("Edge Case — Data Minimal & Aneh", "🧪")

    calc = WaterFootprintCalculator()

    # Test 1: Tidak ada air masuk
    print_section("Test 1: Tidak ada data air")
    hasil = calc.hitung(1, 2025)
    print(f"  Blue WF: {hasil.blue_wf_m3} (harusnya 0)")
    assert hasil.blue_wf_m3 == 0, "Blue WF harus 0!"
    print(f"  ✅ PASS: Blue WF = 0 saat tidak ada data")

    # Test 2: Air dibuang lebih dari diambil
    print_section("Test 2: Air dibuang > diambil")
    calc2 = WaterFootprintCalculator()
    calc2.tambah_air_masuk(DataAirMasuk(SumberAir.PDAM, 100, 1, 2025))
    calc2.tambah_air_keluar(DataAirKeluar(TujuanPembuangan.BADAN_AIR, 500, 1, 2025))
    hasil2 = calc2.hitung(1, 2025)
    print(f"  Blue WF: {hasil2.blue_wf_m3} (harusnya 0, tidak boleh negatif)")
    assert hasil2.blue_wf_m3 == 0, "Blue WF tidak boleh negatif!"
    print(f"  ✅ PASS: Blue WF clamp ke 0")

    # Test 3: Semua di bawah baku mutu → Grey WF = 0
    print_section("Test 3: Semua di bawah baku mutu")
    calc3 = WaterFootprintCalculator()
    calc3.tambah_limbah(DataLimbahCair(
        date(2025, 1, 15), 100,
        bod_mg_l=5, cod_mg_l=10, tss_mg_l=8
    ))
    hasil3 = calc3.hitung(1, 2025)
    print(f"  Grey WF: {hasil3.grey_wf_m3} (harusnya 0)")
    assert hasil3.grey_wf_m3 == 0, "Grey WF harus 0!"
    print(f"  ✅ PASS: Grey WF = 0 saat semua di bawah batas")

    # Test 4: Hanya satu parameter yang melampaui
    print_section("Test 4: Hanya BOD melampaui")
    calc4 = WaterFootprintCalculator()
    calc4.tambah_limbah(DataLimbahCair(
        date(2025, 1, 15), 100,
        bod_mg_l=100, cod_mg_l=50, tss_mg_l=30
    ))
    hasil4 = calc4.hitung(1, 2025)
    print(f"  Grey WF: {hasil4.grey_wf_m3} m³")
    print(f"  Detail: {hasil4.grey_wf_detail}")
    assert 'bod' in hasil4.grey_wf_detail, "BOD harus ada di grey WF detail"
    assert 'cod' not in hasil4.grey_wf_detail, "COD tidak boleh ada (di bawah batas)"
    print(f"  ✅ PASS: Hanya BOD yang hitung grey WF")

    # Test 5: pH di batas
    print_section("Test 5: pH di batas persis")
    checker = ComplianceChecker(KelasAirBaku.C)
    k = checker.cek(DataLimbahCair(
        date(2025, 1, 15), 100, ph=6.0
    ))
    ph_status = [p for p in k.parameter_list if p.nama_parameter == 'pH'][0]
    print(f"  pH 6.0: {ph_status.status.value} (batas: 6.0-9.0)")
    assert ph_status.status == StatusKepatuhan.COMPLIANT
    print(f"  ✅ PASS: pH di batas bawah = compliant")

    # Test 6: Debit sangat kecil
    print_section("Test 6: Debit sangat kecil (0.1 m³/hari)")
    beban = WasteLoadCalculator().hitung(DataLimbahCair(
        date(2025, 1, 15), 0.1, bod_mg_l=100
    ))
    print(f"  Beban BOD: {beban.beban_bod} kg/hari (harusnya 0.01)")
    assert beban.beban_bod == 0.01
    print(f"  ✅ PASS: Debit kecil tetap akurat")

    print("\n  🎉 SEMUA EDGE CASE PASS!")


# ============================================================
# MAIN
# ============================================================
def main():
    print("🧪 WATER ESG ENGINE — TEST CASES")
    print("=" * 70)
    print("8 Skenario pengujian berbagai industri & kondisi")

    test_case_1_pabrik_tekstil()
    test_case_2_pabrik_makanan()
    test_case_3_hotel()
    test_case_4_pabrik_kimia()
    test_case_5_perkebunan_sawit()
    test_case_6_data_bersih()
    test_case_7_data_kritis()
    test_case_8_edge_case()

    print(f"\n{'='*70}")
    print("✅ SEMUA 8 TEST CASE SELESAI!")
    print(f"{'='*70}")


if __name__ == "__main__":
    main()
