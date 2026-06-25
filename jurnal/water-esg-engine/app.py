"""
Water ESG Engine — UI Testing Dashboard
========================================
Streamlit app untuk test perhitungan jejak air & limbah cair.

Jalankan: streamlit run app.py
"""

import sys
import os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

import streamlit as st
from datetime import date, datetime
from models.water_data import (
    DataAirMasuk, DataAirKeluar, DataAirHujan, DataDaurUlang,
    DataLimbahCair, SumberAir, TujuanPembuangan, KelasAirBaku,
    StatusKepatuhan
)
from calculators.water_footprint import WaterFootprintCalculator
from calculators.waste_load import WasteLoadCalculator
from calculators.compliance import ComplianceChecker
from reports.report_generator import ReportGenerator

# ============================================================
# PAGE CONFIG
# ============================================================
st.set_page_config(
    page_title="Water ESG Engine",
    page_icon="💧",
    layout="wide",
)

st.title("💧 Water ESG Engine")
st.caption("Sistem Perhitungan Jejak Air & Limbah Cair | ISO 14046 • GRI 303 • KLHK")

# ============================================================
# SIDEBAR — Info Perusahaan
# ============================================================
with st.sidebar:
    st.header("🏢 Data Perusahaan")
    nama_perusahaan = st.text_input("Nama Perusahaan", "PT Contoh Industri")
    alamat = st.text_input("Alamat", "Kawasan Industri, Jawa Barat")
    sektor = st.selectbox("Sektor Industri", [
        "Manufaktur", "Tekstil & Garmen", "Makanan & Minuman",
        "Kimia & Farmasi", "Pertambangan", "Energi",
        "Property & Konstruksi", "Pertanian", "Lainnya"
    ])
    st.divider()
    st.header("📅 Periode Laporan")
    bulan = st.selectbox("Bulan", range(1, 13), format_func=lambda x: [
        "Januari", "Februari", "Maret", "April", "Mei", "Juni",
        "Juli", "Agustus", "September", "Oktober", "November", "Desember"
    ][x-1])
    tahun = st.number_input("Tahun", 2020, 2030, 2025)

# ============================================================
# TABS
# ============================================================
tab1, tab2, tab3, tab4 = st.tabs([
    "💧 Jejak Air (Water Footprint)",
    "🔬 Limbah Cair (Waste Load)",
    "✅ Kepatuhan Baku Mutu",
    "📄 Laporan ESG"
])

# ============================================================
# TAB 1: WATER FOOTPRINT
# ============================================================
with tab1:
    st.header("💧 Perhitungan Jejak Air (Water Footprint)")

    col_a, col_b = st.columns(2)

    with col_a:
        st.subheader("📥 Air Masuk (Withdrawal)")
        st.caption("Air yang diambil dari sumber")

        sumber_options = {
            "PDAM / Pihak Ketiga": SumberAir.PDAM,
            "Air Tanah (Sumur)": SumberAir.TANAH,
            "Air Permukaan (Sungai/Danau)": SumberAir.PERMUKAAN,
            "Air Laut": SumberAir.LAUT,
        }

        air_masuk_list = []
        for nama, sumber in sumber_options.items():
            vol = st.number_input(
                f"{nama} (m³)",
                min_value=0.0, value=0.0, step=100.0,
                key=f"masuk_{sumber.value}"
            )
            if vol > 0:
                air_masuk_list.append(DataAirMasuk(
                    sumber=sumber, volume_m3=vol,
                    periode_bulan=bulan, periode_tahun=tahun
                ))

        st.divider()
        st.subheader("♻️ Air Daur Ulang")
        vol_daur_ulang = st.number_input("Volume Daur Ulang (m³)", min_value=0.0, value=0.0, step=50.0)

    with col_b:
        st.subheader("📤 Air Keluar (Discharge)")
        st.caption("Air yang dibuang/dikeluarkan")

        tujuan_options = {
            "Badan Air (Sungai/Danau)": TujuanPembuangan.BADAN_AIR,
            "Laut": TujuanPembuangan.LAUT,
            "Evaporasi / Penguapan": TujuanPembuangan.EVAPORASI,
            "IPAL Pihak Ketiga": TujuanPembuangan.PENGOLAHAN_PIHAK_KETIGA,
        }

        air_keluar_list = []
        for nama, tujuan in tujuan_options.items():
            vol = st.number_input(
                f"{nama} (m³)",
                min_value=0.0, value=0.0, step=100.0,
                key=f"keluar_{tujuan.value}"
            )
            if vol > 0:
                air_keluar_list.append(DataAirKeluar(
                    tujuan=tujuan, volume_m3=vol,
                    periode_bulan=bulan, periode_tahun=tahun,
                    sudah_diolah=True
                ))

        st.divider()
        st.subheader("🌧️ Air Hujan (Green WF)")
        vol_hujan = st.number_input("Volume Air Hujan Dimanfaatkan (m³)", min_value=0.0, value=0.0, step=10.0)

    # HITUNG WATER FOOTPRINT
    st.divider()
    if st.button("🔢 Hitung Jejak Air", type="primary", use_container_width=True):
        calc = WaterFootprintCalculator()

        for d in air_masuk_list:
            calc.tambah_air_masuk(d)
        for d in air_keluar_list:
            calc.tambah_air_keluar(d)
        if vol_daur_ulang > 0:
            calc.tambah_daur_ulang(DataDaurUlang(
                volume_m3=vol_daur_ulang,
                tujuan_penggunaan="Daur ulang",
                periode_bulan=bulan, periode_tahun=tahun
            ))
        if vol_hujan > 0:
            calc.tambah_air_hujan(DataAirHujan(
                volume_m3=vol_hujan,
                luas_area_m2=0,
                periode_bulan=bulan, periode_tahun=tahun
            ))

        hasil = calc.hitung(bulan, tahun)

        # TAMPILKAN HASIL
        st.success("✅ Perhitungan selesai!")

        col1, col2, col3, col4 = st.columns(4)
        col1.metric("🔵 Blue WF", f"{hasil.blue_wf_m3:,.2f} m³")
        col2.metric("🟢 Green WF", f"{hasil.green_wf_m3:,.2f} m³")
        col3.metric("⚫ Grey WF", f"{hasil.grey_wf_m3:,.2f} m³")
        col4.metric("📐 Total WF", f"{hasil.total_wf_m3:,.2f} m³", delta=None)

        st.divider()
        col5, col6, col7 = st.columns(3)
        col5.metric("Total Air Diambil", f"{hasil.total_air_diambil_m3:,.2f} m³")
        col6.metric("Total Air Dibuang", f"{hasil.total_air_dibuang_m3:,.2f} m³")
        col7.metric("Air Daur Ulang", f"{hasil.air_daur_ulang_m3:,.2f} m³")

        # GRI 303
        st.subheader("📊 GRI 303:2018")
        gri_3 = calc.get_gri_303_3(bulan, tahun)
        gri_4 = calc.get_gri_303_4(bulan, tahun)
        gri_5 = calc.get_gri_303_5(bulan, tahun)

        g1, g2, g3 = st.columns(3)
        g1.metric("GRI 303-3 Withdrawal", f"{gri_3['total_megalitres']:.4f} ML")
        g2.metric("GRI 303-4 Discharge", f"{gri_4['total_megalitres']:.4f} ML")
        g3.metric("GRI 303-5 Consumption", f"{gri_5['consumption_megalitres']:.4f} ML")

        # Simpan ke session state
        st.session_state['calc'] = calc
        st.session_state['hasil_wf'] = hasil


# ============================================================
# TAB 2: LIMBAH CAIR
# ============================================================
with tab2:
    st.header("🔬 Perhitungan Beban Pencemaran Limbah Cair")

    st.info("💡 Masukkan hasil uji lab limbah cair. Rumus: **Beban (kg/hari) = Konsentrasi (mg/L) × Debit (m³/hari) × 10⁻³**")

    col_input, col_hasil = st.columns(2)

    with col_input:
        st.subheader("📝 Input Data Uji Lab")

        tanggal_uji = st.date_input("Tanggal Pengujian", date(tahun, bulan, 15))
        debit = st.number_input("Debit Limbah (m³/hari)", min_value=0.1, value=100.0, step=10.0)

        st.markdown("**Parameter Kimia (mg/L)** — kosongkan jika tidak diuji")
        bod = st.number_input("BOD₅ (mg/L)", min_value=0.0, value=0.0, step=5.0)
        cod = st.number_input("COD (mg/L)", min_value=0.0, value=0.0, step=10.0)
        tss = st.number_input("TSS (mg/L)", min_value=0.0, value=0.0, step=5.0)
        ph = st.number_input("pH", min_value=0.0, max_value=14.0, value=7.0, step=0.1)
        oil_grease = st.number_input("Oil & Grease (mg/L)", min_value=0.0, value=0.0, step=1.0)
        ammonia = st.number_input("NH₃-N / Ammonia (mg/L)", min_value=0.0, value=0.0, step=1.0)
        suhu = st.number_input("Suhu (°C)", min_value=0.0, max_value=100.0, value=30.0, step=1.0)

    with col_hasil:
        st.subheader("📊 Hasil Perhitungan")

        if st.button("🔬 Hitung Beban Pencemaran", type="primary", use_container_width=True):
            limbah = DataLimbahCair(
                tanggal_pengujian=tanggal_uji,
                debit_m3_per_hari=debit,
                bod_mg_l=bod if bod > 0 else None,
                cod_mg_l=cod if cod > 0 else None,
                tss_mg_l=tss if tss > 0 else None,
                ph=ph if ph > 0 else None,
                oil_grease_mg_l=oil_grease if oil_grease > 0 else None,
                ammonia_mg_l=ammonia if ammonia > 0 else None,
                suhu_c=suhu if suhu > 0 else None,
            )

            waste_calc = WasteLoadCalculator()
            hasil = waste_calc.hitung(limbah)

            st.success("✅ Perhitungan selesai!")
            st.metric("Debit", f"{hasil.debit_m3_per_hari} m³/hari")

            if hasil.rincian:
                st.markdown("**Beban Pencemaran:**")
                for nama, detail in hasil.rincian.items():
                    c1, c2, c3 = st.columns(3)
                    c1.metric(f"{nama} (konsentrasi)", f"{detail['konsentrasi_mg_l']} mg/L")
                    c2.metric(f"{nama} (beban/hari)", f"{detail['beban_kg_per_hari']:.4f} kg")
                    c3.metric(f"{nama} (beban/bulan)", f"{detail['beban_kg_per_bulan']:.2f} kg")

            st.session_state['limbah_data'] = limbah

# ============================================================
# TAB 3: KEPATUHAN BAKU MUTU
# ============================================================
with tab3:
    st.header("✅ Pengecekan Kepatuhan Baku Mutu KLHK")

    st.info("💡 Cek apakah limbah cair sesuai baku mutu berdasarkan **PP 82/2001** dan **PermenLHK P.68/2016**")

    col_kelas, col_param = st.columns(2)

    with col_kelas:
        kelas_air_label = st.radio(
            "Kelas Badan Air Penerima",
            ["Kelas A (Air Minum)", "Kelas B (Air Baku)", "Kelas C (Pertanian/Industri)", "Kelas D (Industri)"],
            index=2
        )
        kelas_map = {
            "Kelas A (Air Minum)": KelasAirBaku.A,
            "Kelas B (Air Baku)": KelasAirBaku.B,
            "Kelas C (Pertanian/Industri)": KelasAirBaku.C,
            "Kelas D (Industri)": KelasAirBaku.D,
        }
        kelas_air = kelas_map[kelas_air_label]

        st.markdown(f"**Baku Mutu {kelas_air_label}:**")
        from calculators.compliance import BAKU_MUTU_KELAS
        bm = BAKU_MUTU_KELAS[kelas_air]
        st.markdown(f"""
        | Parameter | Batas |
        |-----------|-------|
        | BOD₅ | ≤ {bm.bod_max} mg/L |
        | COD | ≤ {bm.cod_max} mg/L |
        | TSS | ≤ {bm.tss_max} mg/L |
        | pH | {bm.ph_min} – {bm.ph_max} |
        | O&G | ≤ {bm.oil_grease_max} mg/L |
        | NH₃-N | ≤ {bm.ammonia_max} mg/L |
        | Suhu | ≤ {bm.suhu_max} °C |
        """)

    with col_param:
        st.markdown("**Input Data Limbah:**")
        tgl_cek = st.date_input("Tanggal Pengujian", date(tahun, bulan, 15), key="tgl_cek")
        debit_cek = st.number_input("Debit (m³/hari)", min_value=0.1, value=100.0, step=10.0, key="debit_cek")
        bod_cek = st.number_input("BOD₅ (mg/L)", min_value=0.0, value=50.0, step=5.0, key="bod_cek")
        cod_cek = st.number_input("COD (mg/L)", min_value=0.0, value=100.0, step=10.0, key="cod_cek")
        tss_cek = st.number_input("TSS (mg/L)", min_value=0.0, value=80.0, step=5.0, key="tss_cek")
        ph_cek = st.number_input("pH", min_value=0.0, max_value=14.0, value=7.0, step=0.1, key="ph_cek")
        og_cek = st.number_input("O&G (mg/L)", min_value=0.0, value=5.0, step=1.0, key="og_cek")
        nh3_cek = st.number_input("NH₃-N (mg/L)", min_value=0.0, value=3.0, step=0.5, key="nh3_cek")

    if st.button("✅ Cek Kepatuhan", type="primary", use_container_width=True):
        data_cek = DataLimbahCair(
            tanggal_pengujian=tgl_cek,
            debit_m3_per_hari=debit_cek,
            bod_mg_l=bod_cek if bod_cek > 0 else None,
            cod_mg_l=cod_cek if cod_cek > 0 else None,
            tss_mg_l=tss_cek if tss_cek > 0 else None,
            ph=ph_cek if ph_cek > 0 else None,
            oil_grease_mg_l=og_cek if og_cek > 0 else None,
            ammonia_mg_l=nh3_cek if nh3_cek > 0 else None,
        )

        checker = ComplianceChecker(kelas_air)
        hasil_cek = checker.cek(data_cek)

        # Status keseluruhan
        if hasil_cek.status_keseluruhan == StatusKepatuhan.COMPLIANT:
            st.success(f"✅ **STATUS: COMPLIANT** — Semua parameter sesuai baku mutu!")
        elif hasil_cek.status_keseluruhan == StatusKepatuhan.WARNING:
            st.warning(f"⚡ **STATUS: WARNING** — Ada parameter yang mendekati batas!")
        else:
            st.error(f"❌ **STATUS: NON-COMPLIANT** — Ada parameter yang melampaui batas!")

        # Detail per parameter
        st.markdown("**Detail Per Parameter:**")
        for p in hasil_cek.parameter_list:
            icon = {"compliant": "✅", "non_compliant": "❌", "warning": "⚡"}
            bm_val = p.nilai_baku_mutu if isinstance(p.nilai_baku_mutu, (int, float)) else str(p.nilai_baku_mutu)
            c1, c2, c3, c4, c5 = st.columns([2, 2, 2, 1, 2])
            c1.write(f"**{p.nama_parameter}**")
            c2.write(f"Aktual: {p.nilai_aktual}")
            c3.write(f"Baku: {bm_val}")
            c4.write(f"{p.rasio:.1f}%")
            c5.write(f"{icon.get(p.status.value, '?')} **{p.status.value.upper()}**")

        st.session_state['hasil_kepatuhan'] = hasil_cek


# ============================================================
# TAB 4: LAPORAN ESG
# ============================================================
with tab4:
    st.header("📄 Generate Laporan ESG Lengkap")

    st.markdown("""
    Laporan ini mencakup:
    - **Water Footprint** (Blue, Green, Grey) sesuai ISO 14046
    - **Beban Pencemaran** limbah cair
    - **Status Kepatuhan** baku mutu KLHK
    - **GRI 303:2018** disclosures
    """)

    if st.button("📄 Generate Laporan ESG", type="primary", use_container_width=True):
        # Ambil data dari session state atau buat baru
        calc = st.session_state.get('calc', WaterFootprintCalculator())
        limbah = st.session_state.get('limbah_data', None)

        gen = ReportGenerator()
        laporan = gen.generate(
            nama_perusahaan=nama_perusahaan,
            alamat=alamat,
            sektor_industri=sektor,
            calculator=calc,
            bulan=bulan, tahun=tahun,
            limbah_data=[limbah] if limbah else None,
            kelas_air=KelasAirBaku.C,
        )

        teks = gen.generate_text_report(laporan)

        st.text_area("Laporan ESG", teks, height=600)

        # Download button
        st.download_button(
            label="📥 Download Laporan (.txt)",
            data=teks,
            file_name=f"laporan_esg_{nama_perusahaan.replace(' ', '_')}_{bulan}_{tahun}.txt",
            mime="text/plain",
        )

        # Export JSON
        import json
        data = gen.export_dict(laporan)
        json_str = json.dumps(data, indent=2, ensure_ascii=False)
        st.download_button(
            label="📥 Download Laporan (.json)",
            data=json_str,
            file_name=f"laporan_esg_{nama_perusahaan.replace(' ', '_')}_{bulan}_{tahun}.json",
            mime="application/json",
        )

# ============================================================
# FOOTER
# ============================================================
st.divider()
st.caption("Water ESG Engine v1.0 | ISO 14046 • GRI 303:2018 • PP 82/2001 • PP 22/2021")
