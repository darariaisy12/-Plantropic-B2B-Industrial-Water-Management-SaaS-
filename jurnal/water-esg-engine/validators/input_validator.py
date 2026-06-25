"""
Validator untuk input data jejak air dan limbah cair.
Memastikan data yang masuk valid sebelum diproses.
"""

from typing import List, Tuple
from models.water_data import DataAirMasuk, DataLimbahCair, DataAirKeluar


class InputValidator:
    """Validasi input data sebelum perhitungan"""

    @staticmethod
    def validasi_air_masuk(data: DataAirMasuk) -> Tuple[bool, List[str]]:
        """Validasi data air masuk"""
        errors = []

        if data.volume_m3 < 0:
            errors.append(f"Volume air tidak boleh negatif: {data.volume_m3}")

        if data.volume_m3 == 0:
            errors.append("Volume air tidak boleh 0")

        if not (1 <= data.periode_bulan <= 12):
            errors.append(f"Bulan tidak valid: {data.periode_bulan} (harus 1-12)")

        if data.periode_tahun < 2000 or data.periode_tahun > 2100:
            errors.append(f"Tahun tidak valid: {data.periode_tahun}")

        return (len(errors) == 0, errors)

    @staticmethod
    def validasi_limbah_cair(data: DataLimbahCair) -> Tuple[bool, List[str]]:
        """Validasi data limbah cair"""
        errors = []

        if data.debit_m3_per_hari <= 0:
            errors.append(f"Debit harus positif: {data.debit_m3_per_hari}")

        if data.debit_m3_per_hari > 1_000_000:
            errors.append(f"Debit terlalu besar (mungkin salah input): {data.debit_m3_per_hari} m³/hari")

        # Validasi parameter kimia
        if data.bod_mg_l is not None and data.bod_mg_l < 0:
            errors.append(f"BOD tidak boleh negatif: {data.bod_mg_l}")

        if data.cod_mg_l is not None and data.cod_mg_l < 0:
            errors.append(f"COD tidak boleh negatif: {data.cod_mg_l}")

        if data.tss_mg_l is not None and data.tss_mg_l < 0:
            errors.append(f"TSS tidak boleh negatif: {data.tss_mg_l}")

        if data.ph is not None and not (0 <= data.ph <= 14):
            errors.append(f"pH harus 0-14: {data.ph}")

        if data.suhu_c is not None and data.suhu_c > 100:
            errors.append(f"Suhu terlalu tinggi: {data.suhu_c}°C")

        # Peringatan (bukan error)
        warnings = []
        if data.bod_mg_l is not None and data.cod_mg_l is not None:
            if data.cod_mg_l < data.bod_mg_l:
                warnings.append(f"COD ({data.cod_mg_l}) lebih kecil dari BOD ({data.bod_mg_l}) — cek ulang")

        return (len(errors) == 0, errors)

    @staticmethod
    def validasi_batch_limbah(data_list: List[DataLimbahCair]) -> Tuple[bool, dict]:
        """Validasi batch data limbah cair"""
        all_errors = {}
        for i, data in enumerate(data_list):
            valid, errors = InputValidator.validasi_limbah_cair(data)
            if not valid:
                all_errors[f"data_{i+1}_{data.tanggal_pengujian}"] = errors

        return (len(all_errors) == 0, all_errors)

    @staticmethod
    def cek_konsistensi_parameter(data_list: List[DataLimbahCair]) -> List[str]:
        """
        Cek konsistensi parameter yang diuji.
        Jika data pertama punya BOD tapi data kedua tidak, beri peringatan.
        """
        if len(data_list) < 2:
            return []

        # Kumpulkan parameter yang ada di setiap data
        parameter_sets = []
        for data in data_list:
            params = set()
            if data.bod_mg_l is not None:
                params.add('BOD')
            if data.cod_mg_l is not None:
                params.add('COD')
            if data.tss_mg_l is not None:
                params.add('TSS')
            if data.ph is not None:
                params.add('pH')
            if data.oil_grease_mg_l is not None:
                params.add('O&G')
            if data.ammonia_mg_l is not None:
                params.add('NH3-N')
            parameter_sets.append(params)

        # Cek apakah semua data punya parameter yang sama
        peringatan = []
        referensi = parameter_sets[0]
        for i, params in enumerate(parameter_sets[1:], 2):
            missing = referensi - params
            extra = params - referensi
            if missing:
                peringatan.append(
                    f"Data #{i}: Parameter {missing} ada di data #1 tapi tidak di data #{i}"
                )
            if extra:
                peringatan.append(
                    f"Data #{i}: Parameter {extra} tidak ada di data #1 tapi ada di data #{i}"
                )

        return peringatan
