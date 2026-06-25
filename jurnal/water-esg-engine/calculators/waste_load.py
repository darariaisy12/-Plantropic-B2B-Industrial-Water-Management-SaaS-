"""
Kalkulator Beban Pencemaran Limbah Cair
========================================
Menghitung beban pencemaran berdasarkan:
- PP 82/2001 tentang Pengelolaan Kualitas Air
- PP 22/2021 tentang PPLH
- PermenLHK P.68/2016 tentang Baku Mutu Air Limbah Domestik

Rumus dasar:
    Beban Pencemaran (kg/hari) = Konsentrasi (mg/L) × Debit (m³/hari) × 10⁻³
"""

import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from typing import List, Optional, Dict
from datetime import date
from models.water_data import DataLimbahCair, HasilBebanPencemaran


class WasteLoadCalculator:
    """
    Menghitung beban pencemaran limbah cair.

    Penggunaan:
        calc = WasteLoadCalculator()
        hasil = calc.hitung(limbah_data)
        semua = calc.hitung_batch([limbah1, limbah2, ...])
    """

    # Konversi: mg/L × m³/hari × 10⁻³ = kg/hari
    FAKTOR_KONVERSI = 1e-3

    def hitung(self, data: DataLimbahCair) -> HasilBebanPencemaran:
        """
        Hitung beban pencemaran untuk satu data uji lab.

        Args:
            data: Data limbah cair hasil uji lab

        Returns:
            HasilBebanPencemaran dengan semua parameter
        """
        debit = data.debit_m3_per_hari
        rincian = {}

        # Mapping parameter: (nama_attr, nama_tampilan)
        parameter_list = [
            ('bod_mg_l', 'BOD₅'),
            ('cod_mg_l', 'COD'),
            ('tss_mg_l', 'TSS'),
            ('oil_grease_mg_l', 'O&G'),
            ('ammonia_mg_l', 'NH₃-N'),
            ('total_nitrogen_mg_l', 'Total N'),
            ('total_fosfor_mg_l', 'Total P'),
        ]

        hasil = HasilBebanPencemaran(
            tanggal_pengujian=data.tanggal_pengujian,
            debit_m3_per_hari=debit,
        )

        for attr, nama in parameter_list:
            nilai = getattr(data, attr, None)
            if nilai is not None:
                beban = self._hitung_satu_parameter(nilai, debit)
                rincian[nama] = {
                    'konsentrasi_mg_l': nilai,
                    'debit_m3_per_hari': debit,
                    'beban_kg_per_hari': round(beban, 4),
                    'beban_ton_per_hari': round(beban / 1000, 6),
                    'beban_kg_per_bulan': round(beban * 30, 2),
                    'beban_ton_per_tahun': round(beban * 365 / 1000, 4),
                }

                # Set atribut hasil
                if attr == 'bod_mg_l':
                    hasil.beban_bod = round(beban, 4)
                elif attr == 'cod_mg_l':
                    hasil.beban_cod = round(beban, 4)
                elif attr == 'tss_mg_l':
                    hasil.beban_tss = round(beban, 4)
                elif attr == 'oil_grease_mg_l':
                    hasil.beban_oil_grease = round(beban, 4)
                elif attr == 'ammonia_mg_l':
                    hasil.beban_ammonia = round(beban, 4)

        hasil.rincian = rincian
        return hasil

    def hitung_batch(self, data_list: List[DataLimbahCair]) -> List[HasilBebanPencemaran]:
        """Hitung beban pencemaran untuk beberapa data uji lab"""
        return [self.hitung(d) for d in data_list]

    def hitung_rata_rata(self, data_list: List[DataLimbahCair]) -> dict:
        """
        Hitung rata-rata beban pencemaran dari beberapa data uji.
        Berguna untuk pelaporan bulanan/tahunan.
        """
        if not data_list:
            return {}

        hasil_list = self.hitung_batch(data_list)
        n = len(hasil_list)

        rata_beban = {}
        for hasil in hasil_list:
            for nama, detail in hasil.rincian.items():
                if nama not in rata_beban:
                    rata_beban[nama] = {
                        'total_kg_per_hari': 0,
                        'count': 0,
                        'konsentrasi_list': [],
                    }
                rata_beban[nama]['total_kg_per_hari'] += detail['beban_kg_per_hari']
                rata_beban[nama]['count'] += 1
                rata_beban[nama]['konsentrasi_list'].append(detail['konsentrasi_mg_l'])

        # Hitung rata-rata
        for nama in rata_beban:
            count = rata_beban[nama]['count']
            rata_beban[nama]['rata_rata_kg_per_hari'] = round(
                rata_beban[nama]['total_kg_per_hari'] / count, 4
            )
            rata_beban[nama]['rata_rata_konsentrasi'] = round(
                sum(rata_beban[nama]['konsentrasi_list']) / count, 2
            )
            rata_beban[nama]['max_konsentrasi'] = max(rata_beban[nama]['konsentrasi_list'])
            rata_beban[nama]['min_konsentrasi'] = min(rata_beban[nama]['konsentrasi_list'])
            del rata_beban[nama]['konsentrasi_list']

        return {
            'jumlah_pengujian': n,
            'periode_awal': min(d.tanggal_pengujian for d in data_list).isoformat(),
            'periode_akhir': max(d.tanggal_pengujian for d in data_list).isoformat(),
            'rata_rata_debit_m3_per_hari': round(
                sum(d.debit_m3_per_hari for d in data_list) / n, 2
            ),
            'rincian_parameter': rata_beban,
        }

    def hitung_tren(self, data_list: List[DataLimbahCair]) -> dict:
        """
        Hitun tren beban pencemaran dari waktu ke waktu.
        Berguna untuk monitoring dan early warning.
        """
        if len(data_list) < 2:
            return {'error': 'Minimal 2 data untuk analisis tren'}

        # Urutkan berdasarkan tanggal
        sorted_data = sorted(data_list, key=lambda d: d.tanggal_pengujian)
        hasil_list = self.hitung_batch(sorted_data)

        tren = {}
        for i, hasil in enumerate(hasil_list):
            bulan_key = hasil.tanggal_pengujian.strftime('%Y-%m')
            for nama, detail in hasil.rincian.items():
                if nama not in tren:
                    tren[nama] = []
                tren[nama].append({
                    'tanggal': hasil.tanggal_pengujian.isoformat(),
                    'bulan': bulan_key,
                    'konsentrasi': detail['konsentrasi_mg_l'],
                    'beban_kg_per_hari': detail['beban_kg_per_hari'],
                })

        # Hitung perubahan persentase
        for nama in tren:
            if len(tren[nama]) >= 2:
                pertama = tren[nama][0]['beban_kg_per_hari']
                terakhir = tren[nama][-1]['beban_kg_per_hari']
                if pertama > 0:
                    tren[nama + '_perubahan_pct'] = round(
                        (terakhir - pertama) / pertama * 100, 2
                    )

        return tren

    # ----------------------------------------------------------
    # HELPER
    # ----------------------------------------------------------

    @staticmethod
    def _hitung_satu_parameter(konsentrasi_mg_l: float, debit_m3_per_hari: float) -> float:
        """
        Hitung beban pencemaran satu parameter.

        Rumus: Beban = Konsentrasi × Debit × 10⁻³

        Args:
            konsentrasi_mg_l: Konsentrasi polutan (mg/L)
            debit_m3_per_hari: Debit limbah (m³/hari)

        Returns:
            Beban pencemaran (kg/hari)
        """
        return konsentrasi_mg_l * debit_m3_per_hari * 1e-3

    @staticmethod
    def hitung_grey_wf_parameter(
        volume_m3: float,
        konsentrasi_aktual: float,
        baku_mutu: float
    ) -> float:
        """
        Hitung Grey WF untuk satu parameter.

        Rumus: Grey WF = V × (C_aktual − C_baku) / C_baku

        Args:
            volume_m3: Volume limbah (m³)
            konsentrasi_aktual: Konsentrasi aktual (mg/L)
            baku_mutu: Baku mutu (mg/L)

        Returns:
            Grey WF (m³)
        """
        if konsentrasi_aktual <= baku_mutu:
            return 0.0
        return volume_m3 * (konsentrasi_aktual - baku_mutu) / baku_mutu
