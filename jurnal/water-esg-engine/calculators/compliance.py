"""
Pengecekan Kepatuhan terhadap Baku Mutu Air Limbah
===================================================
Sesuai:
- PP 82/2001 tentang Pengelolaan Kualitas Air dan Pengendalian Pencemaran Air
- PP 22/2021 tentang Penyelenggaraan PPLH
- PermenLHK P.68/2016 tentang Baku Mutu Air Limbah Domestik
- Keputusan Menteri LH No. 112/2003 tentang Baku Mutu Air Limbah

Baku mutu berdasarkan kelas badan air penerima:
- Kelas A: Air yang dapat digunakan sebagai air minum
- Kelas B: Air yang dapat digunakan sebagai air baku air minum
- Kelas C: Air yang dapat digunakan untuk pertanian, peternakan, perikanan
- Kelas D: Air yang dapat digunakan untuk industri
"""

import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from typing import List, Optional
from models.water_data import (
    DataLimbahCair, BakuMutu, KelasAirBaku,
    HasilKepatuhan, StatusParameter, StatusKepatuhan
)


# ============================================================
# BAKU MUTU DEFAULT (PP 82/2001 + PermenLHK)
# ============================================================

BAKU_MUTU_KELAS = {
    KelasAirBaku.A: BakuMutu(
        kelas_air=KelasAirBaku.A,
        bod_max=25.0,
        cod_max=50.0,
        tss_max=50.0,
        ph_min=6.5,
        ph_max=8.5,
        oil_grease_max=5.0,
        ammonia_max=0.5,
        suhu_max=35.0,
        warna_max=50.0,
        deterjen_max=0.5,
    ),
    KelasAirBaku.B: BakuMutu(
        kelas_air=KelasAirBaku.B,
        bod_max=50.0,
        cod_max=100.0,
        tss_max=100.0,
        ph_min=6.0,
        ph_max=9.0,
        oil_grease_max=10.0,
        ammonia_max=2.0,
        suhu_max=35.0,
        warna_max=100.0,
        deterjen_max=2.0,
    ),
    KelasAirBaku.C: BakuMutu(
        kelas_air=KelasAirBaku.C,
        bod_max=100.0,
        cod_max=250.0,
        tss_max=200.0,
        ph_min=6.0,
        ph_max=9.0,
        oil_grease_max=15.0,
        ammonia_max=10.0,
        suhu_max=35.0,
        warna_max=200.0,
        deterjen_max=5.0,
    ),
    KelasAirBaku.D: BakuMutu(
        kelas_air=KelasAirBaku.D,
        bod_max=150.0,
        cod_max=350.0,
        tss_max=400.0,
        ph_min=5.0,
        ph_max=9.0,
        oil_grease_max=20.0,
        ammonia_max=15.0,
        suhu_max=38.0,
        warna_max=400.0,
        deterjen_max=10.0,
    ),
}


class ComplianceChecker:
    """
    Mengecek kepatuhan limbah cair terhadap baku mutu.

    Penggunaan:
        checker = ComplianceChecker(KelasAirBaku.C)
        hasil = checker.cek(data_limbah)
        semua = checker.cek_batch([data1, data2, ...])
        ringkasan = checker.ringkasan_komprehensif([data1, data2, ...])
    """

    # Batas warning: jika aktual >= baku_mutu × faktor ini, status WARNING
    FAKTOR_WARNING = 0.8  # 80% dari baku mutu

    def __init__(self, kelas_air: KelasAirBaku = KelasAirBaku.C):
        self._kelas_air = kelas_air
        self._baku_mutu = BAKU_MUTU_KELAS[kelas_air]

    def set_kelas_air(self, kelas_air: KelasAirBaku):
        """Ubah kelas air baku yang digunakan"""
        self._kelas_air = kelas_air
        self._baku_mutu = BAKU_MUTU_KELAS[kelas_air]

    def cek(self, data: DataLimbahCair) -> HasilKepatuhan:
        """
        Cek kepatuhan satu data uji lab.

        Args:
            data: Data limbah cair hasil uji lab

        Returns:
            HasilKepatuhan dengan status per parameter
        """
        parameter_list = []
        j_compliant = 0
        j_non_compliant = 0
        j_warning = 0

        # Daftar parameter yang dicek: (attr_data, nama_tampilan, satuan, attr_baku_mutu, higher_is_worse)
        checks = [
            ('bod_mg_l', 'BOD₅', 'mg/L', 'bod_max', True),
            ('cod_mg_l', 'COD', 'mg/L', 'cod_max', True),
            ('tss_mg_l', 'TSS', 'mg/L', 'tss_max', True),
            ('ph', 'pH', '-', None, False),  # pH khusus: punya min & max
            ('oil_grease_mg_l', 'O&G', 'mg/L', 'oil_grease_max', True),
            ('ammonia_mg_l', 'NH₃-N', 'mg/L', 'ammonia_max', True),
            ('suhu_c', 'Suhu', '°C', 'suhu_max', True),
            ('warna_tcu', 'Warna', 'TCU', 'warna_max', True),
            ('deterjen_mg_l', 'Deterjen (MBAS)', 'mg/L', 'deterjen_max', True),
        ]

        for attr, nama, satuan, baku_attr, higher_is_worse in checks:
            nilai = getattr(data, attr, None)

            if nilai is None:
                continue

            # Khusus pH: cek range
            if attr == 'ph':
                status, rasio, ket = self._cek_ph(
                    nilai, self._baku_mutu.ph_min, self._baku_mutu.ph_max
                )
                parameter_list.append(StatusParameter(
                    nama_parameter=nama,
                    satuan=satuan,
                    nilai_aktual=nilai,
                    nilai_baku_mutu=f"{self._baku_mutu.ph_min}-{self._baku_mutu.ph_max}",
                    rasio=rasio,
                    status=status,
                    keterangan=ket,
                ))
            else:
                batas = getattr(self._baku_mutu, baku_attr, None)
                if batas is None:
                    continue

                if higher_is_worse:
                    rasio = round(nilai / batas * 100, 2)
                    if nilai > batas:
                        status = StatusKepatuhan.NON_COMPLIANT
                        ket = f"Melampaui batas ({nilai} > {batas})"
                    elif nilai >= batas * self.FAKTOR_WARNING:
                        status = StatusKepatuhan.WARNING
                        ket = f"Mendekati batas ({nilai} / {batas} = {rasio}%)"
                    else:
                        status = StatusKepatuhan.COMPLIANT
                        ket = f"Sesuai ({nilai} ≤ {batas})"
                else:
                    rasio = 0
                    status = StatusKepatuhan.COMPLIANT
                    ket = "OK"

                parameter_list.append(StatusParameter(
                    nama_parameter=nama,
                    satuan=satuan,
                    nilai_aktual=nilai,
                    nilai_baku_mutu=batas,
                    rasio=rasio,
                    status=status,
                    keterangan=ket,
                ))

            # Hitung jumlah
            if parameter_list[-1].status == StatusKepatuhan.COMPLIANT:
                j_compliant += 1
            elif parameter_list[-1].status == StatusKepatuhan.NON_COMPLIANT:
                j_non_compliant += 1
            else:
                j_warning += 1

        # Status keseluruhan
        if j_non_compliant > 0:
            status_keseluruhan = StatusKepatuhan.NON_COMPLIANT
        elif j_warning > 0:
            status_keseluruhan = StatusKepatuhan.WARNING
        else:
            status_keseluruhan = StatusKepatuhan.COMPLIANT

        return HasilKepatuhan(
            kelas_air=self._kelas_air,
            tanggal_pengujian=data.tanggal_pengujian,
            status_keseluruhan=status_keseluruhan,
            parameter_list=parameter_list,
            jumlah_compliant=j_compliant,
            jumlah_non_compliant=j_non_compliant,
            jumlah_warning=j_warning,
        )

    def cek_batch(self, data_list: List[DataLimbahCair]) -> List[HasilKepatuhan]:
        """Cek kepatuhan untuk beberapa data uji lab"""
        return [self.cek(d) for d in data_list]

    def ringkasan_komprehensif(self, data_list: List[DataLimbahCair]) -> dict:
        """
        Buat ringkasan kepatuhan komprehensif untuk pelaporan.

        Berguna untuk:
        - Monitoring berkala
        - Laporan ke KLHK
        - Dashboard ESG
        """
        if not data_list:
            return {'error': 'Tidak ada data'}

        hasil_list = self.cek_batch(data_list)
        n = len(hasil_list)

        # Hitung statistik
        total_compliant = sum(h.jumlah_compliant for h in hasil_list)
        total_non_compliant = sum(h.jumlah_non_compliant for h in hasil_list)
        total_warning = sum(h.jumlah_warning for h in hasil_list)
        total_parameter = total_compliant + total_non_compliant + total_warning

        # Hitung persentase kepatuhan per parameter
        param_stats = {}
        for hasil in hasil_list:
            for p in hasil.parameter_list:
                if p.nama_parameter not in param_stats:
                    param_stats[p.nama_parameter] = {
                        'total': 0, 'compliant': 0, 'non_compliant': 0,
                        'warning': 0, 'nilai_list': [], 'rasio_list': [],
                    }
                param_stats[p.nama_parameter]['total'] += 1
                if p.status == StatusKepatuhan.COMPLIANT:
                    param_stats[p.nama_parameter]['compliant'] += 1
                elif p.status == StatusKepatuhan.NON_COMPLIANT:
                    param_stats[p.nama_parameter]['non_compliant'] += 1
                else:
                    param_stats[p.nama_parameter]['warning'] += 1
                param_stats[p.nama_parameter]['nilai_list'].append(p.nilai_aktual)
                param_stats[p.nama_parameter]['rasio_list'].append(p.rasio)

        # Hitung rata-rata dan persentase
        for nama in param_stats:
            s = param_stats[nama]
            s['persentase_kepatuhan'] = round(s['compliant'] / s['total'] * 100, 2)
            s['rata_rata_nilai'] = round(sum(s['nilai_list']) / len(s['nilai_list']), 2)
            s['max_nilai'] = max(s['nilai_list'])
            s['min_nilai'] = min(s['nilai_list'])
            s['rata_rata_rasio'] = round(sum(s['rasio_list']) / len(s['rasio_list']), 2)
            del s['nilai_list']
            del s['rasio_list']

        # Parameter paling sering melanggar
        paling_sering_melanggar = sorted(
            [(nama, s['non_compliant']) for nama, s in param_stats.items()],
            key=lambda x: x[1], reverse=True
        )

        return {
            'kelas_air': self._kelas_air.value,
            'jumlah_pengujian': n,
            'periode_awal': min(h.tanggal_pengujian for h in hasil_list).isoformat(),
            'periode_akhir': max(h.tanggal_pengujian for h in hasil_list).isoformat(),
            'keseluruhan': {
                'total_parameter_diuji': total_parameter,
                'compliant': total_compliant,
                'non_compliant': total_non_compliant,
                'warning': total_warning,
                'persentase_kepatuhan': round(total_compliant / total_parameter * 100, 2) if total_parameter else 0,
            },
            'detail_per_parameter': param_stats,
            'paling_sering_melanggar': paling_sering_melanggar[:5],
            'rekomendasi': self._buat_rekomendasi(param_stats),
        }

    def _cek_ph(self, ph_aktual: float, ph_min: float, ph_max: float) -> tuple:
        """Cek kepatuhan pH (punya batas atas dan bawah)"""
        if ph_min <= ph_aktual <= ph_max:
            return StatusKepatuhan.COMPLIANT, 0, f"Sesuai ({ph_min} ≤ {ph_aktual} ≤ {ph_max})"

        # Hitung rasio jarak dari batas terdekat
        if ph_aktual < ph_min:
            rasio = round((ph_min - ph_aktual) / ph_min * 100, 2)
            status = StatusKepatuhan.NON_COMPLIANT
            ket = f"Terlalu asam ({ph_aktual} < {ph_min})"
        else:
            rasio = round((ph_aktual - ph_max) / ph_max * 100, 2)
            status = StatusKepatuhan.NON_COMPLIANT
            ket = f"Terlalu basa ({ph_aktual} > {ph_max})"

        # Warning jika mendekati batas
        margin = (ph_max - ph_min) * 0.1
        if ph_aktual < ph_min and ph_aktual >= ph_min - margin:
            status = StatusKepatuhan.WARNING
            ket = f"Mendekati batas bawah pH"
        elif ph_aktual > ph_max and ph_aktual <= ph_max + margin:
            status = StatusKepatuhan.WARNING
            ket = f"Mendekati batas atas pH"

        return status, rasio, ket

    def _buat_rekomendasi(self, param_stats: dict) -> List[str]:
        """Buat rekomendasi berdasarkan hasil kepatuhan"""
        rekomendasi = []

        for nama, stats in param_stats.items():
            if stats['non_compliant'] > 0:
                pct_gagal = round(stats['non_compliant'] / stats['total'] * 100)
                rekomendasi.append(
                    f"⚠️  {nama}: {pct_gagal}% pengujian melampaui baku mutu. "
                    f"Perlu evaluasi proses pengolahan limbah."
                )
            elif stats['warning'] > 0:
                rekomendasi.append(
                    f"⚡ {nama}: Mendekati batas baku mutu. "
                    f"Lakukan monitoring lebih ketat."
                )

        if not rekomendasi:
            rekomendasi.append("✅ Semua parameter sesuai baku mutu. Pertahankan!")

        return rekomendasi
