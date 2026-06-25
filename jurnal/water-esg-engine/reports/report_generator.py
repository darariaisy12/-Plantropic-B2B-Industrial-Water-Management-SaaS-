"""
Generator Laporan ESG — Jejak Air & Limbah Cair
=================================================
Menghasilkan laporan lengkap yang siap audit, sesuai:
- GRI 303:2018 (Water and Effluents)
- Format KLHK Indonesia
- Standar ESG internasional

Output: dictionary terstruktur yang siap dikonversi ke PDF/HTML
"""

import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from typing import List, Optional
from datetime import datetime
from models.water_data import (
    LaporanESG, HasilJejakAir, HasilBebanPencemaran, HasilKepatuhan,
    StatusKepatuhan
)
from calculators.water_footprint import WaterFootprintCalculator
from calculators.waste_load import WasteLoadCalculator
from calculators.compliance import ComplianceChecker


class ReportGenerator:
    """
    Menghasilkan laporan ESG lengkap.

    Penggunaan:
        gen = ReportGenerator()
        laporan = gen.generate(
            nama_perusahaan="PT Contoh",
            alamat="Jakarta",
            sektor="Manufaktur",
            calculator=wf_calc,
            bulan=1, tahun=2025,
            limbah_data=[...],
            kelas_air=KelasAirBaku.C,
        )
        gen.export_json(laporan, "laporan.json")
    """

    def generate(
        self,
        nama_perusahaan: str,
        alamat: str,
        sektor_industri: str,
        calculator: WaterFootprintCalculator,
        bulan: int,
        tahun: int,
        limbah_data: list = None,
        kelas_air=None,
    ) -> LaporanESG:
        """
        Generate laporan ESG lengkap untuk satu periode.
        """
        # Hitung jejak air
        jejak_air = calculator.hitung(bulan, tahun)

        # Hitung beban pencemaran
        beban_list = []
        if limbah_data:
            waste_calc = WasteLoadCalculator()
            beban_list = waste_calc.hitung_batch(limbah_data)

        # Cek kepatuhan
        kepatuhan_list = []
        if limbah_data and kelas_air:
            checker = ComplianceChecker(kelas_air)
            kepatuhan_list = checker.cek_batch(limbah_data)

        # GRI 303
        gri_303_3 = calculator.get_gri_303_3(bulan, tahun)
        gri_303_4 = calculator.get_gri_303_4(bulan, tahun)
        gri_303_5 = calculator.get_gri_303_5(bulan, tahun)

        return LaporanESG(
            nama_perusahaan=nama_perusahaan,
            alamat=alamat,
            sektor_industri=sektor_industri,
            periode_bulan=bulan,
            periode_tahun=tahun,
            jejak_air=jejak_air,
            beban_pencemaran=beban_list if beban_list else None,
            kepatuhan=kepatuhan_list if kepatuhan_list else None,
            gri_303_3_withdrawal=gri_303_3,
            gri_303_4_discharge=gri_303_4,
            gri_303_5_consumption=gri_303_5['consumption_m3'],
        )

    def generate_tahunan(
        self,
        nama_perusahaan: str,
        alamat: str,
        sektor_industri: str,
        calculator: WaterFootprintCalculator,
        tahun: int,
        limbah_data_all: dict = None,
        kelas_air=None,
    ) -> dict:
        """
        Generate laporan tahunan (ringkasan 12 bulan).

        Args:
            limbah_data_all: dict {bulan: [DataLimbahCair, ...]}
        """
        bulanan = []
        for bulan in range(1, 13):
            limbah = limbah_data_all.get(bulan, []) if limbah_data_all else []
            laporan = self.generate(
                nama_perusahaan, alamat, sektor_industri,
                calculator, bulan, tahun, limbah, kelas_air
            )
            bulanan.append(laporan)

        # Hitung total tahunan
        total_tahunan = calculator.hitung_total_tahunan(tahun)

        return {
            'laporan_tahunan': True,
            'tahun': tahun,
            'perusahaan': {
                'nama': nama_perusahaan,
                'alamat': alamat,
                'sektor': sektor_industri,
            },
            'ringkasan_tahunan': total_tahunan,
            'laporan_bulanan': bulanan,
        }

    # ----------------------------------------------------------
    # EXPORT METHODS
    # ----------------------------------------------------------

    def export_dict(self, laporan: LaporanESG) -> dict:
        """Konversi laporan ke dictionary untuk serialisasi"""

        def _dataclass_to_dict(obj):
            if hasattr(obj, '__dataclass_fields__'):
                result = {}
                for f in obj.__dataclass_fields__:
                    result[f] = _dataclass_to_dict(getattr(obj, f))
                return result
            elif isinstance(obj, list):
                return [_dataclass_to_dict(i) for i in obj]
            elif isinstance(obj, dict):
                return {k: _dataclass_to_dict(v) for k, v in obj.items()}
            elif hasattr(obj, 'value') and not isinstance(obj, (int, float, str, bool)):
                return obj.value
            elif hasattr(obj, 'isoformat'):
                return obj.isoformat()
            return obj

        return _dataclass_to_dict(laporan)

    def export_json(self, laporan: LaporanESG, filepath: str):
        """Export laporan ke file JSON"""
        import json
        data = self.export_dict(laporan)
        with open(filepath, 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=2, ensure_ascii=False)
        return filepath

    def generate_text_report(self, laporan: LaporanESG) -> str:
        """
        Generate laporan dalam format teks (bisa langsung dibaca).
        Berguna untuk preview sebelum generate PDF.
        """
        lines = []
        lines.append("=" * 70)
        lines.append("LAPORAN ESG — JEJAK AIR & LIMBAH CAIR")
        lines.append("=" * 70)
        lines.append("")
        lines.append(f"Perusahaan  : {laporan.nama_perusahaan}")
        lines.append(f"Alamat      : {laporan.alamat}")
        lines.append(f"Sektor      : {laporan.sektor_industri}")
        lines.append(f"Periode     : {laporan.periode_bulan}/{laporan.periode_tahun}")
        lines.append(f"Tanggal     : {datetime.now().strftime('%Y-%m-%d %H:%M')}")
        lines.append("")

        # === JEJAK AIR ===
        if laporan.jejak_air:
            ja = laporan.jejak_air
            lines.append("-" * 70)
            lines.append("1. JEJAK AIR (WATER FOOTPRINT)")
            lines.append("-" * 70)
            lines.append("")
            lines.append(f"  Total Air Diambil   : {ja.total_air_diambil_m3:,.2f} m³")
            lines.append(f"  Total Air Dibuang   : {ja.total_air_dibuang_m3:,.2f} m³")
            lines.append(f"  Air Daur Ulang      : {ja.air_daur_ulang_m3:,.2f} m³")
            lines.append("")
            lines.append("  Komponen Jejak Air:")
            lines.append(f"    Blue Water Footprint  : {ja.blue_wf_m3:,.2f} m³")
            lines.append(f"    Green Water Footprint : {ja.green_wf_m3:,.2f} m³")
            lines.append(f"    Grey Water Footprint  : {ja.grey_wf_m3:,.2f} m³")
            lines.append(f"    ─────────────────────────────────")
            lines.append(f"    TOTAL WATER FOOTPRINT : {ja.total_wf_m3:,.2f} m³")
            lines.append("")

            if ja.rincian_sumber:
                lines.append("  Rincian per Sumber Air:")
                for sumber, vol in ja.rincian_sumber.items():
                    lines.append(f"    - {sumber}: {vol:,.2f} m³")
                lines.append("")

            if ja.grey_wf_detail:
                lines.append("  Detail Grey Water Footprint:")
                for param, detail in ja.grey_wf_detail.items():
                    lines.append(f"    - {param}: {detail.get('grey_wf_m3', 0):,.2f} m³")
                    lines.append(f"      (Aktual: {detail.get('konsentrasi_aktual', 0)} mg/L, "
                               f"Baku: {detail.get('baku_mutu', 0)} mg/L)")
                lines.append("")

        # === GRI 303 ===
        lines.append("-" * 70)
        lines.append("2. PELAPORAN GRI 303:2018 (WATER AND EFFLUENTS)")
        lines.append("-" * 70)
        lines.append("")

        if laporan.gri_303_3_withdrawal:
            g3 = laporan.gri_303_3_withdrawal
            lines.append(f"  GRI 303-3: Water Withdrawal")
            lines.append(f"    Total: {g3.get('total_megalitres', 0):.4f} megalitres")
            for sumber, vol in g3.get('rincian_megalitres', {}).items():
                lines.append(f"      - {sumber}: {vol:.4f} ML")
            lines.append("")

        if laporan.gri_303_4_discharge:
            g4 = laporan.gri_303_4_discharge
            lines.append(f"  GRI 303-4: Water Discharge")
            lines.append(f"    Total: {g4.get('total_megalitres', 0):.4f} megalitres")
            for tujuan, vol in g4.get('rincian_megalitres', {}).items():
                lines.append(f"      - {tujuan}: {vol:.4f} ML")
            lines.append("")

        lines.append(f"  GRI 303-5: Water Consumption")
        lines.append(f"    Total: {laporan.gri_303_5_consumption / 1000:.4f} megalitres")
        lines.append("")

        # === BEBAN PENCEMARAN ===
        if laporan.beban_pencemaran:
            lines.append("-" * 70)
            lines.append("3. BEBAN PENCEMARAN LIMBAH CAIR")
            lines.append("-" * 70)
            lines.append("")

            for i, beban in enumerate(laporan.beban_pencemaran):
                lines.append(f"  Pengujian #{i+1}: {beban.tanggal_pengujian}")
                lines.append(f"  Debit: {beban.debit_m3_per_hari:,.2f} m³/hari")
                lines.append("")
                lines.append(f"  {'Parameter':<15} {'Konsentrasi':>12} {'Beban':>15} {'Beban/Bulan':>15}")
                lines.append(f"  {'':15} {'(mg/L)':>12} {'(kg/hari)':>15} {'(kg/bulan)':>15}")
                lines.append(f"  {'─'*15} {'─'*12} {'─'*15} {'─'*15}")

                for nama, detail in beban.rincian.items():
                    lines.append(
                        f"  {nama:<15} "
                        f"{detail['konsentrasi_mg_l']:>12.2f} "
                        f"{detail['beban_kg_per_hari']:>15.4f} "
                        f"{detail['beban_kg_per_bulan']:>15.2f}"
                    )
                lines.append("")

        # === KEPATUHAN ===
        if laporan.kepatuhan:
            lines.append("-" * 70)
            lines.append("4. STATUS KEPATUHAN BAKU MUTU")
            lines.append("-" * 70)
            lines.append("")

            for i, kepatuhan in enumerate(laporan.kepatuhan):
                status_icon = {
                    StatusKepatuhan.COMPLIANT: "✅",
                    StatusKepatuhan.NON_COMPLIANT: "❌",
                    StatusKepatuhan.WARNING: "⚡",
                }

                lines.append(f"  Pengujian #{i+1}: {kepatuhan.tanggal_pengujian}")
                lines.append(f"  Kelas Air: {kepatuhan.kelas_air.value}")
                lines.append(f"  Status: {status_icon.get(kepatuhan.status_keseluruhan, '?')} "
                           f"{kepatuhan.status_keseluruhan.value.upper()}")
                lines.append(f"  Compliant: {kepatuhan.jumlah_compliant}, "
                           f"Warning: {kepatuhan.jumlah_warning}, "
                           f"Non-Compliant: {kepatuhan.jumlah_non_compliant}")
                lines.append("")
                lines.append(f"  {'Parameter':<15} {'Aktual':>10} {'Baku Mutu':>12} {'Rasio':>8} {'Status':>12}")
                lines.append(f"  {'─'*15} {'─'*10} {'─'*12} {'─'*8} {'─'*12}")

                for p in kepatuhan.parameter_list:
                    icon = status_icon.get(p.status, '?')
                    bm = p.nilai_baku_mutu if isinstance(p.nilai_baku_mutu, (int, float)) else str(p.nilai_baku_mutu)
                    lines.append(
                        f"  {p.nama_parameter:<15} "
                        f"{p.nilai_aktual:>10.2f} "
                        f"{str(bm):>12} "
                        f"{p.rasio:>8.1f}% "
                        f"{icon} {p.status.value:>10}"
                    )
                lines.append("")

        lines.append("=" * 70)
        lines.append("Laporan ini dihasilkan secara otomatis oleh Water ESG Engine")
        lines.append(f"Generated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        lines.append("=" * 70)

        return "\n".join(lines)
