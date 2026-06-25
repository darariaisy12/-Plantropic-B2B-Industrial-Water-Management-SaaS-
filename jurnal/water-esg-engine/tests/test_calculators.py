#!/usr/bin/env python3
"""
Unit Tests untuk Water ESG Engine
"""

import sys
import os
import unittest
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
from validators.input_validator import InputValidator


class TestWaterFootprintCalculator(unittest.TestCase):
    """Test perhitungan jejak air"""

    def setUp(self):
        self.calc = WaterFootprintCalculator()

    def test_blue_wf_sederhana(self):
        """Test Blue WF: diambil 1000 m³, dibuang kembali 400 m³ = 600 m³"""
        self.calc.tambah_air_masuk(DataAirMasuk(
            sumber=SumberAir.PDAM, volume_m3=1000,
            periode_bulan=1, periode_tahun=2025
        ))
        self.calc.tambah_air_keluar(DataAirKeluar(
            tujuan=TujuanPembuangan.BADAN_AIR, volume_m3=400,
            periode_bulan=1, periode_tahun=2025
        ))

        hasil = self.calc.hitung(1, 2025)
        self.assertEqual(hasil.blue_wf_m3, 600.0)

    def test_blue_wf_tidak_negatif(self):
        """Blue WF tidak boleh negatif jika buangan > ambil"""
        self.calc.tambah_air_masuk(DataAirMasuk(
            sumber=SumberAir.PDAM, volume_m3=100,
            periode_bulan=1, periode_tahun=2025
        ))
        self.calc.tambah_air_keluar(DataAirKeluar(
            tujuan=TujuanPembuangan.BADAN_AIR, volume_m3=500,
            periode_bulan=1, periode_tahun=2025
        ))

        hasil = self.calc.hitung(1, 2025)
        self.assertEqual(hasil.blue_wf_m3, 0.0)

    def test_green_wf(self):
        """Test Green WF dari air hujan"""
        self.calc.tambah_air_hujan(DataAirHujan(
            volume_m3=150, luas_area_m2=1000,
            periode_bulan=1, periode_tahun=2025
        ))

        hasil = self.calc.hitung(1, 2025)
        self.assertEqual(hasil.green_wf_m3, 150.0)

    def test_grey_wf_melampaui_batas(self):
        """Test Grey WF saat melampaui baku mutu"""
        self.calc.tambah_limbah(DataLimbahCair(
            tanggal_pengujian=date(2025, 1, 15),
            debit_m3_per_hari=100,
            bod_mg_l=100,  # Baku mutu default: 50 mg/L
            cod_mg_l=200,  # Baku mutu default: 100 mg/L
        ))

        hasil = self.calc.hitung(1, 2025)
        # Grey WF BOD = (100*30) * (100-50)/50 = 3000 * 1 = 3000
        # Grey WF COD = (100*30) * (200-100)/100 = 3000 * 1 = 3000
        # Total = 6000
        self.assertEqual(hasil.grey_wf_m3, 6000.0)

    def test_grey_wf_di_bawah_batas(self):
        """Test Grey WF = 0 jika semua di bawah baku mutu"""
        self.calc.tambah_limbah(DataLimbahCair(
            tanggal_pengujian=date(2025, 1, 15),
            debit_m3_per_hari=100,
            bod_mg_l=30,   # Di bawah 50
            cod_mg_l=80,   # Di bawah 100
        ))

        hasil = self.calc.hitung(1, 2025)
        self.assertEqual(hasil.grey_wf_m3, 0.0)

    def test_total_wf(self):
        """Test total WF = blue + green + grey"""
        self.calc.tambah_air_masuk(DataAirMasuk(
            sumber=SumberAir.PDAM, volume_m3=500,
            periode_bulan=1, periode_tahun=2025
        ))
        self.calc.tambah_air_hujan(DataAirHujan(
            volume_m3=100, luas_area_m2=500,
            periode_bulan=1, periode_tahun=2025
        ))

        hasil = self.calc.hitung(1, 2025)
        self.assertEqual(hasil.total_wf_m3, hasil.blue_wf_m3 + hasil.green_wf_m3 + hasil.grey_wf_m3)

    def test_gri_303_3_withdrawal(self):
        """Test GRI 303-3 output"""
        self.calc.tambah_air_masuk(DataAirMasuk(
            sumber=SumberAir.PDAM, volume_m3=1000,
            periode_bulan=1, periode_tahun=2025
        ))

        gri = self.calc.get_gri_303_3(1, 2025)
        self.assertEqual(gri['disclosure'], 'GRI 303-3')
        self.assertAlmostEqual(gri['total_megalitres'], 1.0, places=4)

    def test_periode_berbeda(self):
        """Test perhitungan tidak tercampur antar periode"""
        self.calc.tambah_air_masuk(DataAirMasuk(
            sumber=SumberAir.PDAM, volume_m3=1000,
            periode_bulan=1, periode_tahun=2025
        ))
        self.calc.tambah_air_masuk(DataAirMasuk(
            sumber=SumberAir.PDAM, volume_m3=2000,
            periode_bulan=2, periode_tahun=2025
        ))

        hasil_jan = self.calc.hitung(1, 2025)
        hasil_feb = self.calc.hitung(2, 2025)
        self.assertEqual(hasil_jan.total_air_diambil_m3, 1000)
        self.assertEqual(hasil_feb.total_air_diambil_m3, 2000)


class TestWasteLoadCalculator(unittest.TestCase):
    """Test perhitungan beban pencemaran"""

    def setUp(self):
        self.calc = WasteLoadCalculator()

    def test_beban_pencemaran_dasar(self):
        """Test rumus dasar: beban = konsentrasi × debit × 10⁻³"""
        data = DataLimbahCair(
            tanggal_pengujian=date(2025, 1, 15),
            debit_m3_per_hari=100,
            bod_mg_l=50,
        )

        hasil = self.calc.hitung(data)
        # 50 × 100 × 0.001 = 5 kg/hari
        self.assertEqual(hasil.beban_bod, 5.0)

    def test_beban_multi_parameter(self):
        """Test hitung beberapa parameter sekaligus"""
        data = DataLimbahCair(
            tanggal_pengujian=date(2025, 1, 15),
            debit_m3_per_hari=200,
            bod_mg_l=80,
            cod_mg_l=150,
            tss_mg_l=100,
        )

        hasil = self.calc.hitung(data)
        self.assertEqual(hasil.beban_bod, 16.0)    # 80 × 200 × 0.001
        self.assertEqual(hasil.beban_cod, 30.0)    # 150 × 200 × 0.001
        self.assertEqual(hasil.beban_tss, 20.0)    # 100 × 200 × 0.001

    def test_konversi_satuan(self):
        """Test konversi kg/hari ke ton/tahun"""
        data = DataLimbahCair(
            tanggal_pengujian=date(2025, 1, 15),
            debit_m3_per_hari=100,
            bod_mg_l=100,
        )

        hasil = self.calc.hitung(data)
        detail = hasil.rincian['BOD₅']
        # 10 kg/hari → 3650 kg/tahun → 3.65 ton/tahun
        self.assertAlmostEqual(detail['beban_ton_per_tahun'], 3.65, places=2)

    def test_rata_rata_batch(self):
        """Test perhitungan rata-rata dari beberapa data"""
        data_list = [
            DataLimbahCair(
                tanggal_pengujian=date(2025, 1, 10),
                debit_m3_per_hari=100, bod_mg_l=50,
            ),
            DataLimbahCair(
                tanggal_pengujian=date(2025, 1, 20),
                debit_m3_per_hari=100, bod_mg_l=100,
            ),
        ]

        hasil = self.calc.hitung_rata_rata(data_list)
        # Rata-rata BOD = (50+100)/2 = 75
        self.assertEqual(hasil['jumlah_pengujian'], 2)
        self.assertEqual(hasil['rincian_parameter']['BOD₅']['rata_rata_konsentrasi'], 75.0)


class TestComplianceChecker(unittest.TestCase):
    """Test pengecekan kepatuhan baku mutu"""

    def setUp(self):
        self.checker = ComplianceChecker(KelasAirBaku.C)

    def test_compliant(self):
        """Test data yang sesuai baku mutu"""
        data = DataLimbahCair(
            tanggal_pengujian=date(2025, 1, 15),
            debit_m3_per_hari=100,
            bod_mg_l=30,    # < 100 (baku mutu Kelas C)
            cod_mg_l=80,    # < 250
            tss_mg_l=50,    # < 200
            ph=7.0,         # 6-9
        )

        hasil = self.checker.cek(data)
        self.assertEqual(hasil.status_keseluruhan, StatusKepatuhan.COMPLIANT)
        self.assertEqual(hasil.jumlah_non_compliant, 0)

    def test_non_compliant(self):
        """Test data yang melampaui baku mutu"""
        data = DataLimbahCair(
            tanggal_pengujian=date(2025, 1, 15),
            debit_m3_per_hari=100,
            bod_mg_l=150,   # > 100 (baku mutu Kelas C)
            cod_mg_l=300,   # > 250
            ph=7.0,
        )

        hasil = self.checker.cek(data)
        self.assertEqual(hasil.status_keseluruhan, StatusKepatuhan.NON_COMPLIANT)
        self.assertGreater(hasil.jumlah_non_compliant, 0)

    def test_warning(self):
        """Test data yang mendekati batas (warning)"""
        data = DataLimbahCair(
            tanggal_pengujian=date(2025, 1, 15),
            debit_m3_per_hari=100,
            bod_mg_l=85,    # 85% dari 100 → WARNING (>80%)
            ph=7.0,
        )

        hasil = self.checker.cek(data)
        self.assertEqual(hasil.status_keseluruhan, StatusKepatuhan.WARNING)

    def test_ph_di_bawah_batas(self):
        """Test pH terlalu asam"""
        data = DataLimbahCair(
            tanggal_pengujian=date(2025, 1, 15),
            debit_m3_per_hari=100,
            ph=4.5,  # < 6.0 (bawah Kelas C)
        )

        hasil = self.checker.cek(data)
        self.assertEqual(hasil.status_keseluruhan, StatusKepatuhan.NON_COMPLIANT)

    def test_ganti_kelas_air(self):
        """Test perubahan kelas air mengubah hasil"""
        data = DataLimbahCair(
            tanggal_pengujian=date(2025, 1, 15),
            debit_m3_per_hari=100,
            bod_mg_l=30,
        )

        # Kelas C: batas 100 → compliant
        checker_c = ComplianceChecker(KelasAirBaku.C)
        hasil_c = checker_c.cek(data)
        self.assertEqual(hasil_c.status_keseluruhan, StatusKepatuhan.COMPLIANT)

        # Kelas A: batas 25 → non-compliant
        checker_a = ComplianceChecker(KelasAirBaku.A)
        hasil_a = checker_a.cek(data)
        self.assertEqual(hasil_a.status_keseluruhan, StatusKepatuhan.NON_COMPLIANT)


class TestInputValidator(unittest.TestCase):
    """Test validasi input"""

    def test_volume_negatif(self):
        data = DataAirMasuk(
            sumber=SumberAir.PDAM, volume_m3=-100,
            periode_bulan=1, periode_tahun=2025
        )
        valid, errors = InputValidator.validasi_air_masuk(data)
        self.assertFalse(valid)
        self.assertTrue(any("negatif" in e for e in errors))

    def test_bulan_tidak_valid(self):
        data = DataAirMasuk(
            sumber=SumberAir.PDAM, volume_m3=100,
            periode_bulan=13, periode_tahun=2025
        )
        valid, errors = InputValidator.validasi_air_masuk(data)
        self.assertFalse(valid)

    def test_ph_tidak_valid(self):
        data = DataLimbahCair(
            tanggal_pengujian=date(2025, 1, 15),
            debit_m3_per_hari=100,
            ph=15,  # > 14
        )
        valid, errors = InputValidator.validasi_limbah_cair(data)
        self.assertFalse(valid)

    def test_data_valid(self):
        data = DataLimbahCair(
            tanggal_pengujian=date(2025, 1, 15),
            debit_m3_per_hari=100,
            bod_mg_l=50, cod_mg_l=100, tss_mg_l=80,
            ph=7.0,
        )
        valid, errors = InputValidator.validasi_limbah_cair(data)
        self.assertTrue(valid)
        self.assertEqual(len(errors), 0)


if __name__ == '__main__':
    unittest.main(verbosity=2)
