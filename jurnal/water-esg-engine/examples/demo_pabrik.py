#!/usr/bin/env python3
"""
DEMO: Simulasi Perhitungan Jejak Air & Limbah Cair untuk Pabrik
================================================================
Contoh penggunaan Water ESG Engine untuk:
1. Menghitung jejak air (Blue, Green, Grey WF)
2. Menghitung beban pencemaran limbah cair
3. Mengecek kepatuhan baku mutu KLHK
4. Generate laporan ESG lengkap
"""

import sys
import os
from datetime import date

# Setup path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from models.water_data import (
    DataAirMasuk, DataAirKeluar, DataAirHujan, DataDaurUlang,
    DataLimbahCair, SumberAir, TujuanPembuangan, KelasAirBaku
)
from calculators.water_footprint import WaterFootprintCalculator
from calculators.waste_load import WasteLoadCalculator
from calculators.compliance import ComplianceChecker
from reports.report_generator import ReportGenerator


def main():
    print("🏭 DEMO: Water ESG Engine — Simulasi Pabrik Tekstil")
    print("=" * 60)

    # =====================================================
    # 1. SETUP DATA — Pabrik Tekstil PT Maju Bersama
    # =====================================================

    calc = WaterFootprintCalculator()

    # --- Air masuk (Januari 2025) ---
    # Air PDAM untuk proses produksi
    calc.tambah_air_masuk(DataAirMasuk(
        sumber=SumberAir.PDAM,
        volume_m3=5000,
        periode_bulan=1, periode_tahun=2025,
        keterangan="Air proses produksi tekstil"
    ))

    # Air tanah dari sumur
    calc.tambah_air_masuk(DataAirMasuk(
        sumber=SumberAir.TANAH,
        volume_m3=3000,
        periode_bulan=1, periode_tahun=2025,
        keterangan="Air sumur untuk cooling tower"
    ))

    # Air sungai untuk pemadam kebakaran (cadangan)
    calc.tambah_air_masuk(DataAirMasuk(
        sumber=SumberAir.PERMUKAAN,
        volume_m3=500,
        periode_bulan=1, periode_tahun=2025,
        keterangan="Air cadangan dari sungai"
    ))

    # --- Air keluar (pembuangan) ---
    calc.tambah_air_keluar(DataAirKeluar(
        tujuan=TujuanPembuangan.BADAN_AIR,
        volume_m3=4000,
        periode_bulan=1, periode_tahun=2025,
        sudah_diolah=True,
        keterangan="Buangan ke sungai setelah IPAL"
    ))

    calc.tambah_air_keluar(DataAirKeluar(
        tujuan=TujuanPembuangan.EVAPORASI,
        volume_m3=1500,
        periode_bulan=1, periode_tahun=2025,
        keterangan="Penguapan dari cooling tower"
    ))

    # --- Air hujan (rainwater harvesting) ---
    calc.tambah_air_hujan(DataAirHujan(
        volume_m3=200,
        luas_area_m2=5000,
        periode_bulan=1, periode_tahun=2025,
        keterangan="Penampungan air hujan atap pabrik"
    ))

    # --- Air daur ulang ---
    calc.tambah_daur_ulang(DataDaurUlang(
        volume_m3=800,
        tujuan_penggunaan="Flushing toilet & siram tanaman",
        periode_bulan=1, periode_tahun=2025,
    ))

    # --- Data limbah cair (hasil uji lab) ---
    calc.tambah_limbah(DataLimbahCair(
        tanggal_pengujian=date(2025, 1, 15),
        debit_m3_per_hari=150,
        bod_mg_l=85,       # Di atas baku mutu Kelas C (100)
        cod_mg_l=180,      # Di bawah baku mutu (250)
        tss_mg_l=120,      # Di bawah baku mutu (200)
        ph=7.2,
        oil_grease_mg_l=8,
        ammonia_mg_l=5,
        suhu_c=32,
    ))

    calc.tambah_limbah(DataLimbahCair(
        tanggal_pengujian=date(2025, 1, 22),
        debit_m3_per_hari=145,
        bod_mg_l=95,       # Mendekati batas
        cod_mg_l=220,      # Mendekati batas
        tss_mg_l=180,      # Mendekati batas
        ph=6.8,
        oil_grease_mg_l=12,
        ammonia_mg_l=8,
        suhu_c=33,
    ))

    # =====================================================
    # 2. HITUNG JEJAK AIR
    # =====================================================
    print("\n💧 MENGHITUNG JEJAK AIR...")
    hasil_wf = calc.hitung(1, 2025)

    print(f"\n  📊 Hasil Water Footprint Januari 2025:")
    print(f"  ├─ Total Air Diambil    : {hasil_wf.total_air_diambil_m3:>10,.2f} m³")
    print(f"  ├─ Total Air Dibuang    : {hasil_wf.total_air_dibuang_m3:>10,.2f} m³")
    print(f"  ├─ Air Daur Ulang       : {hasil_wf.air_daur_ulang_m3:>10,.2f} m³")
    print(f"  │")
    print(f"  ├─ 🔵 Blue WF           : {hasil_wf.blue_wf_m3:>10,.2f} m³")
    print(f"  ├─ 🟢 Green WF          : {hasil_wf.green_wf_m3:>10,.2f} m³")
    print(f"  ├─ ⚫ Grey WF           : {hasil_wf.grey_wf_m3:>10,.2f} m³")
    print(f"  └─ 📐 TOTAL WF          : {hasil_wf.total_wf_m3:>10,.2f} m³")

    # =====================================================
    # 3. HITUNG BEBAN PENCEMARAN
    # =====================================================
    print("\n\n🔬 MENGHITUNG BEBAN PENCEMARAN...")
    waste_calc = WasteLoadCalculator()

    limbah_data = [
        DataLimbahCair(
            tanggal_pengujian=date(2025, 1, 15),
            debit_m3_per_hari=150,
            bod_mg_l=85, cod_mg_l=180, tss_mg_l=120,
            ph=7.2, oil_grease_mg_l=8, ammonia_mg_l=5,
        ),
        DataLimbahCair(
            tanggal_pengujian=date(2025, 1, 22),
            debit_m3_per_hari=145,
            bod_mg_l=95, cod_mg_l=220, tss_mg_l=180,
            ph=6.8, oil_grease_mg_l=12, ammonia_mg_l=8,
        ),
    ]

    for i, limbah in enumerate(limbah_data):
        hasil = waste_calc.hitung(limbah)
        print(f"\n  📋 Pengujian #{i+1} ({hasil.tanggal_pengujian}):")
        print(f"     Debit: {hasil.debit_m3_per_hari} m³/hari")
        for nama, detail in hasil.rincian.items():
            print(f"     {nama}: {detail['konsentrasi_mg_l']} mg/L → "
                  f"{detail['beban_kg_per_hari']:.4f} kg/hari")

    # =====================================================
    # 4. CEK KEPATUHAN BAKU MUTU
    # =====================================================
    print("\n\n✅ MENGECEK KEPATUHAN BAKU MUTU (Kelas C)...")
    checker = ComplianceChecker(KelasAirBaku.C)

    for i, limbah in enumerate(limbah_data):
        hasil = checker.cek(limbah)
        status_icon = "✅" if hasil.status_keseluruhan.value == "compliant" else "❌"
        print(f"\n  {status_icon} Pengujian #{i+1} ({hasil.tanggal_pengujian}):")
        print(f"     Status: {hasil.status_keseluruhan.value.upper()}")
        print(f"     Compliant: {hasil.jumlah_compliant}, "
              f"Warning: {hasil.jumlah_warning}, "
              f"Non-Compliant: {hasil.jumlah_non_compliant}")

        for p in hasil.parameter_list:
            icon = {"compliant": "✅", "non_compliant": "❌", "warning": "⚡"}
            bm = p.nilai_baku_mutu if isinstance(p.nilai_baku_mutu, (int, float)) else str(p.nilai_baku_mutu)
            print(f"     {icon.get(p.status.value, '?')} {p.nama_parameter}: "
                  f"{p.nilai_aktual} / {bm} = {p.rasio:.1f}%")

    # =====================================================
    # 5. GENERATE LAPORAN ESG LENGKAP
    # =====================================================
    print("\n\n📄 GENERATE LAPORAN ESG...")
    gen = ReportGenerator()

    laporan = gen.generate(
        nama_perusahaan="PT Maju Bersama Textile",
        alamat="Kawasan Industri Candi, Semarang, Jawa Tengah",
        sektor_industri="Tekstil & Garmen",
        calculator=calc,
        bulan=1, tahun=2025,
        limbah_data=limbah_data,
        kelas_air=KelasAirBaku.C,
    )

    # Print laporan teks
    teks = gen.generate_text_report(laporan)
    print("\n" + teks)

    # Export ke JSON
    output_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "output")
    os.makedirs(output_dir, exist_ok=True)

    json_path = os.path.join(output_dir, "laporan_esg_jan2025.json")
    gen.export_json(laporan, json_path)
    print(f"\n📁 Laporan JSON disimpan di: {json_path}")

    # =====================================================
    # 6. GRI 303 OUTPUT
    # =====================================================
    print("\n\n📊 GRI 303:2018 DISCLOSURES:")
    gri_303_3 = calc.get_gri_303_3(1, 2025)
    gri_303_4 = calc.get_gri_303_4(1, 2025)
    gri_303_5 = calc.get_gri_303_5(1, 2025)

    print(f"\n  GRI 303-3 Water Withdrawal:")
    print(f"    Total: {gri_303_3['total_megalitres']:.4f} megalitres")
    for sumber, vol in gri_303_3['rincian_megalitres'].items():
        print(f"      - {sumber}: {vol:.4f} ML")

    print(f"\n  GRI 303-4 Water Discharge:")
    print(f"    Total: {gri_303_4['total_megalitres']:.4f} megalitres")

    print(f"\n  GRI 303-5 Water Consumption:")
    print(f"    Total: {gri_303_5['consumption_megalitres']:.4f} megalitres")

    print("\n\n✅ DEMO SELESAI!")


if __name__ == "__main__":
    main()
