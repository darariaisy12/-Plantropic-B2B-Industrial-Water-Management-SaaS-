"""
Kalkulator Jejak Air (Water Footprint Calculator)
==================================================
Sesuai standar:
- ISO 14046:2014 (Water Footprint — Principles, requirements and guidelines)
- Water Footprint Network (Hoekstra & Hung, 2002)
- GRI 303:2018 (Water and Effluents)

Komponen:
1. Blue Water Footprint  — air permukaan & tanah yang diambil
2. Green Water Footprint — air hujan yang dimanfaatkan
3. Grey Water Footprint  — volume air untuk asimilasi polutan
"""

import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from typing import List, Optional
from models.water_data import (
    DataAirMasuk, DataAirKeluar, DataAirHujan, DataDaurUlang,
    DataLimbahCair, SumberAir, TujuanPembuangan,
    HasilJejakAir
)


# Baku mutu default (PP 82/2001 Kelas C — umum untuk industri)
BAKU_MUTU_DEFAULT = {
    'bod': 50.0,       # mg/L
    'cod': 100.0,      # mg/L
    'tss': 100.0,      # mg/L
    'ammonia': 10.0,   # mg/L
    'total_nitrogen': 20.0,  # mg/L
    'total_fosfor': 5.0,     # mg/L
}


class WaterFootprintCalculator:
    """
    Menghitung jejak air (water footprint) perusahaan per periode.

    Penggunaan:
        calc = WaterFootprintCalculator()
        calc.tambah_air_masuk(data)
        calc.tambah_limbah(data)
        hasil = calc.hitung(bulan, tahun)
    """

    def __init__(self, baku_mutu_grey: Optional[dict] = None):
        self._air_masuk: List[DataAirMasuk] = []
        self._air_keluar: List[DataAirKeluar] = []
        self._air_hujan: List[DataAirHujan] = []
        self._daur_ulang: List[DataDaurUlang] = []
        self._limbah_cair: List[DataLimbahCair] = []
        self._baku_mutu = baku_mutu_grey or BAKU_MUTU_DEFAULT

    # ----------------------------------------------------------
    # INPUT METHODS
    # ----------------------------------------------------------

    def tambah_air_masuk(self, data: DataAirMasuk):
        """Tambah data air yang diambil dari sumber"""
        self._air_masuk.append(data)

    def tambah_air_masuk_batch(self, data_list: List[DataAirMasuk]):
        """Tambah beberapa data air masuk sekaligus"""
        self._air_masuk.extend(data_list)

    def tambah_air_keluar(self, data: DataAirKeluar):
        """Tambah data air yang dibuang"""
        self._air_keluar.append(data)

    def tambah_air_keluar_batch(self, data_list: List[DataAirKeluar]):
        self._air_keluar.extend(data_list)

    def tambah_air_hujan(self, data: DataAirHujan):
        """Tambah data pemanfaatan air hujan"""
        self._air_hujan.append(data)

    def tambah_daur_ulang(self, data: DataDaurUlang):
        """Tambah data air daur ulang"""
        self._daur_ulang.append(data)

    def tambah_limbah(self, data: DataLimbahCair):
        """Tambah data hasil uji lab limbah cair"""
        self._limbah_cair.append(data)

    def tambah_limbah_batch(self, data_list: List[DataLimbahCair]):
        self._limbah_cair.extend(data_list)

    # ----------------------------------------------------------
    # BLUE WATER FOOTPRINT
    # ----------------------------------------------------------

    def _hitung_blue_wf(self, bulan: int, tahun: int) -> float:
        """
        Blue WF = Total air yang diambil − Total air yang dikembalikan

        Air yang diambil: PDAM, sumur, sungai, laut (bukan air hujan/daur ulang)
        Air yang dikembalikan: air yang dibuang kembali ke sumber alami
        """
        # Filter data sesuai periode
        air_diambil = sum(
            d.volume_m3 for d in self._air_masuk
            if d.periode_bulan == bulan and d.periode_tahun == tahun
            and d.sumber not in (SumberAir.AIR_HUJAN, SumberAir.DAUR_ULANG)
        )

        air_dibuang_kembali = sum(
            d.volume_m3 for d in self._air_keluar
            if d.periode_bulan == bulan and d.periode_tahun == tahun
            and d.tujuan in (TujuanPembuangan.BADAN_AIR, TujuanPembuangan.LAUT)
        )

        return max(0, air_diambil - air_dibuang_kembali)

    # ----------------------------------------------------------
    # GREEN WATER FOOTPRINT
    # ----------------------------------------------------------

    def _hitung_green_wf(self, bulan: int, tahun: int) -> float:
        """
        Green WF = Volume air hujan yang dimanfaatkan

        Hanya relevan untuk perusahaan yang memanfaatkan air hujan
        (pertanian, perkebunan, atau yang punya rainwater harvesting)
        """
        return sum(
            d.volume_m3 for d in self._air_hujan
            if d.periode_bulan == bulan and d.periode_tahun == tahun
        )

    # ----------------------------------------------------------
    # GREY WATER FOOTPRINT
    # ----------------------------------------------------------

    def _hitung_grey_wf(self, bulan: int, tahun: int) -> tuple:
        """
        Grey WF = Σ [V × (C_aktual − C_baku_mutu) / C_baku_mutu]

        Dimana:
        - V = volume limbah yang dibuang (m³)
        - C_aktual = konsentrasi aktual polutan (mg/L)
        - C_baku_mutu = baku mutu yang diizinkan (mg/L)

        Hanya dihitung jika C_aktual > C_baku_mutu (melampaui batas)
        Jika di bawah batas, grey WF = 0 untuk parameter tersebut.

        Returns: (total_grey_wf, detail_per_parameter)
        """
        # Filter limbah sesuai periode
        limbah_periode = [
            d for d in self._limbah_cair
            if d.tanggal_pengujian.month == bulan
            and d.tanggal_pengujian.year == tahun
        ]

        if not limbah_periode:
            return 0.0, {}

        total_grey = 0.0
        detail = {}

        # Parameter yang bisa dihitung grey WF-nya
        parameter_map = {
            'bod': ('bod_mg_l', 'bod'),
            'cod': ('cod_mg_l', 'cod'),
            'tss': ('tss_mg_l', 'tss'),
            'ammonia': ('ammonia_mg_l', 'ammonia'),
            'total_nitrogen': ('total_nitrogen_mg_l', 'total_nitrogen'),
            'total_fosfor': ('total_fosfor_mg_l', 'total_fosfor'),
        }

        for limbah in limbah_periode:
            # Volume limbah per hari, kalikan 30 untuk estimasi bulanan
            volume_bulanan = limbah.debit_m3_per_hari * 30

            for nama_param, (attr, baku_key) in parameter_map.items():
                nilai_aktual = getattr(limbah, attr, None)
                nilai_baku = self._baku_mutu.get(baku_key)

                if nilai_aktual is None or nilai_baku is None:
                    continue

                if nilai_aktual > nilai_baku:
                    grey_wf = volume_bulanan * (nilai_aktual - nilai_baku) / nilai_baku
                    total_grey += grey_wf

                    if nama_param not in detail:
                        detail[nama_param] = {
                            'volume_m3': volume_bulanan,
                            'konsentrasi_aktual': nilai_aktual,
                            'baku_mutu': nilai_baku,
                            'grey_wf_m3': 0.0
                        }
                    detail[nama_param]['grey_wf_m3'] += grey_wf

        return total_grey, detail

    # ----------------------------------------------------------
    # MAIN CALCULATION
    # ----------------------------------------------------------

    def hitung(self, bulan: int, tahun: int) -> HasilJejakAir:
        """
        Hitung jejak air lengkap untuk periode tertentu.

        Args:
            bulan: 1-12
            tahun: tahun

        Returns:
            HasilJejakAir dengan semua komponen
        """
        # Hitung masing-masing komponen
        blue_wf = self._hitung_blue_wf(bulan, tahun)
        green_wf = self._hitung_green_wf(bulan, tahun)
        grey_wf, grey_detail = self._hitung_grey_wf(bulan, tahun)
        total_wf = blue_wf + green_wf + grey_wf

        # Hitung total air diambil
        total_diambil = sum(
            d.volume_m3 for d in self._air_masuk
            if d.periode_bulan == bulan and d.periode_tahun == tahun
        )

        # Hitung total air dibuang
        total_dibuang = sum(
            d.volume_m3 for d in self._air_keluar
            if d.periode_bulan == bulan and d.periode_tahun == tahun
        )

        # Hitung air daur ulang
        total_daur_ulang = sum(
            d.volume_m3 for d in self._daur_ulang
            if d.periode_bulan == bulan and d.periode_tahun == tahun
        )

        # Rincian per sumber air
        rincian = {}
        for d in self._air_masuk:
            if d.periode_bulan == bulan and d.periode_tahun == tahun:
                key = d.sumber.value
                rincian[key] = rincian.get(key, 0) + d.volume_m3

        return HasilJejakAir(
            periode_bulan=bulan,
            periode_tahun=tahun,
            total_air_diambil_m3=total_diambil,
            total_air_dibuang_m3=total_dibuang,
            air_daur_ulang_m3=total_daur_ulang,
            blue_wf_m3=round(blue_wf, 2),
            green_wf_m3=round(green_wf, 2),
            grey_wf_m3=round(grey_wf, 2),
            total_wf_m3=round(total_wf, 2),
            rincian_sumber=rincian,
            grey_wf_detail=grey_detail,
        )

    def hitung_tahunan(self, tahun: int) -> List[HasilJejakAir]:
        """Hitung jejak air untuk semua bulan dalam satu tahun"""
        hasil = []
        for bulan in range(1, 13):
            hasil.append(self.hitung(bulan, tahun))
        return hasil

    def hitung_total_tahunan(self, tahun: int) -> dict:
        """Hitung total jejak air untuk satu tahun penuh"""
        bulanan = self.hitung_tahunan(tahun)
        return {
            'tahun': tahun,
            'total_blue_wf_m3': sum(h.blue_wf_m3 for h in bulanan),
            'total_green_wf_m3': sum(h.green_wf_m3 for h in bulanan),
            'total_grey_wf_m3': sum(h.grey_wf_m3 for h in bulanan),
            'total_wf_m3': sum(h.total_wf_m3 for h in bulanan),
            'total_air_diambil_m3': sum(h.total_air_diambil_m3 for h in bulanan),
            'total_air_dibuang_m3': sum(h.total_air_dibuang_m3 for h in bulanan),
            'total_daur_ulang_m3': sum(h.air_daur_ulang_m3 for h in bulanan),
            'rincian_bulanan': bulanan,
        }

    # ----------------------------------------------------------
    # GRI 303 OUTPUT
    # ----------------------------------------------------------

    def get_gri_303_3(self, bulan: int, tahun: int) -> dict:
        """
        GRI 303-3: Water Withdrawal
        Total penarikan air per sumber dalam megalitres
        """
        rincian = {}
        for d in self._air_masuk:
            if d.periode_bulan == bulan and d.periode_tahun == tahun:
                key = d.sumber.value
                rincian[key] = rincian.get(key, 0) + d.volume_m3

        total_m3 = sum(rincian.values())
        return {
            'disclosure': 'GRI 303-3',
            'judul': 'Water Withdrawal',
            'periode': f"{bulan}/{tahun}",
            'total_m3': round(total_m3, 2),
            'total_megalitres': round(total_m3 / 1000, 4),
            'rincian_m3': rincian,
            'rincian_megalitres': {k: round(v/1000, 4) for k, v in rincian.items()},
        }

    def get_gri_303_4(self, bulan: int, tahun: int) -> dict:
        """
        GRI 303-4: Water Discharge
        Total pembuangan air per tujuan dalam megalitres
        """
        rincian = {}
        for d in self._air_keluar:
            if d.periode_bulan == bulan and d.periode_tahun == tahun:
                key = d.tujuan.value
                rincian[key] = rincian.get(key, 0) + d.volume_m3

        total_m3 = sum(rincian.values())
        return {
            'disclosure': 'GRI 303-4',
            'judul': 'Water Discharge',
            'periode': f"{bulan}/{tahun}",
            'total_m3': round(total_m3, 2),
            'total_megalitres': round(total_m3 / 1000, 4),
            'rincian_m3': rincian,
            'rincian_megalitres': {k: round(v/1000, 4) for k, v in rincian.items()},
        }

    def get_gri_303_5(self, bulan: int, tahun: int) -> dict:
        """
        GRI 303-5: Water Consumption
        Total konsumsi air = Withdrawal − Discharge
        """
        withdrawal = self.get_gri_303_3(bulan, tahun)
        discharge = self.get_gri_303_4(bulan, tahun)
        consumption = withdrawal['total_m3'] - discharge['total_m3']

        return {
            'disclosure': 'GRI 303-5',
            'judul': 'Water Consumption',
            'periode': f"{bulan}/{tahun}",
            'withdrawal_m3': withdrawal['total_m3'],
            'discharge_m3': discharge['total_m3'],
            'consumption_m3': round(consumption, 2),
            'consumption_megalitres': round(consumption / 1000, 4),
        }

    def reset(self):
        """Reset semua data input"""
        self._air_masuk.clear()
        self._air_keluar.clear()
        self._air_hujan.clear()
        self._daur_ulang.clear()
        self._limbah_cair.clear()
