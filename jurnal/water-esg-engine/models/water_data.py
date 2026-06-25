"""
Model data untuk input dan output perhitungan jejak air & limbah cair.
Sesuai standar ISO 14046, GRI 303:2018, dan regulasi KLHK Indonesia.
"""

from dataclasses import dataclass, field
from typing import Optional
from datetime import date
from enum import Enum


# ============================================================
# ENUMS
# ============================================================

class SumberAir(Enum):
    """Sumber air sesuai GRI 303-3"""
    PERMUKAAN = "surface_water"          # Sungai, danau, waduk
    TANAH = "groundwater"                # Sumur, air tanah
    LAUT = "seawater"                    # Air laut
    AIR_HUJAN = "rainwater"              # Air hujan
    PDAM = "third_party"                 # Air dari pihak ketiga (PDAM, dll)
    DAUR_ULANG = "recycled"              # Air daur ulang

class TujuanPembuangan(Enum):
    """Tujuan pembuangan air limbah sesuai GRI 303-4"""
    BADAN_AIR = "surface_water"          # Sungai, danau
    LAUT = "seawater"                    # Pembuangan ke laut
    TANAH = "groundwater"                # Injeksi ke tanah
    PENGOLAHAN_PIHAK_KETIGA = "third_party"  # Ke IPAL pihak lain
    EVAPORASI = "evaporation"            # Penguapan
    IRIGASI = "irrigation"              # Untuk irigasi

class KelasAirBaku(Enum):
    """Kelas air baku sesuai PP 82/2001"""
    A = "A"  # Air minum tanpa pengolahan
    B = "B"  # Air baku air minum setelah pengolahan
    C = "C"  # Pertanian, peternakan, perikanan
    D = "D"  # Industri, pembangkit listrik, dll

class StatusKepatuhan(Enum):
    COMPLIANT = "compliant"
    NON_COMPLIANT = "non_compliant"
    WARNING = "warning"  # Mendekati batas


# ============================================================
# INPUT DATA MODELS
# ============================================================

@dataclass
class DataAirMasuk:
    """Data air yang diambil/dimasukkan ke fasilitas per periode"""
    sumber: SumberAir
    volume_m3: float                     # Volume dalam m³
    periode_bulan: int                   # Bulan (1-12)
    periode_tahun: int                   # Tahun
    keterangan: str = ""

@dataclass
class DataAirKeluar:
    """Data air yang dibuang/dikeluarkan dari fasilitas per periode"""
    tujuan: TujuanPembuangan
    volume_m3: float                     # Volume dalam m³
    periode_bulan: int
    periode_tahun: int
    sudah_diolah: bool = False           # Apakah sudah melalui IPAL?
    keterangan: str = ""

@dataclass
class DataAirHujan:
    """Data pemanfaatan air hujan"""
    volume_m3: float                     # Volume air hujan yang dimanfaatkan
    luas_area_m2: float                  # Luas area penampungan (m²)
    periode_bulan: int
    periode_tahun: int
    keterangan: str = ""

@dataclass
class DataDaurUlang:
    """Data air daur ulang/reuse"""
    volume_m3: float                     # Volume air yang didaur ulang
    tujuan_penggunaan: str               # Untuk apa air daur ulang dipakai
    periode_bulan: int
    periode_tahun: int
    keterangan: str = ""

@dataclass
class DataLimbahCair:
    """Data hasil uji lab limbah cair"""
    tanggal_pengujian: date
    debit_m3_per_hari: float             # Debit limbah (m³/hari)
    # Parameter standar
    bod_mg_l: Optional[float] = None     # BOD5 (mg/L)
    cod_mg_l: Optional[float] = None     # COD (mg/L)
    tss_mg_l: Optional[float] = None     # TSS (mg/L)
    ph: Optional[float] = None           # pH
    oil_grease_mg_l: Optional[float] = None  # O&G (mg/L)
    ammonia_mg_l: Optional[float] = None    # NH3-N (mg/L)
    total_nitrogen_mg_l: Optional[float] = None
    total_fosfor_mg_l: Optional[float] = None
    # Parameter tambahan
    suhu_c: Optional[float] = None       # Suhu (°C)
    warna_tcu: Optional[float] = None    # Warna (TCU)
    deterjen_mg_l: Optional[float] = None  # MBAS/Deterjen (mg/L)
    sisa_chlor_mg_l: Optional[float] = None  # Sisa Chlor
    keterangan: str = ""

@dataclass
class BakuMutu:
    """Baku mutu air limbah berdasarkan kelas air baku"""
    kelas_air: KelasAirBaku
    # Semua dalam mg/L
    bod_max: float
    cod_max: float
    tss_max: float
    ph_min: float
    ph_max: float
    oil_grease_max: Optional[float] = None
    ammonia_max: Optional[float] = None
    suhu_max: Optional[float] = 35.0     # °C
    warna_max: Optional[float] = None
    deterjen_max: Optional[float] = None


# ============================================================
# OUTPUT DATA MODELS
# ============================================================

@dataclass
class HasilJejakAir:
    """Hasil perhitungan jejak air per periode"""
    periode_bulan: int
    periode_tahun: int
    # Volume input/output (m³)
    total_air_diambil_m3: float          # Total air masuk
    total_air_dibuang_m3: float          # Total air keluar
    air_daur_ulang_m3: float             # Air yang didaur ulang
    # Water Footprint (m³)
    blue_wf_m3: float                    # Blue WF
    green_wf_m3: float                   # Green WF
    grey_wf_m3: float                    # Grey WF
    total_wf_m3: float                   # Total WF
    # Rincian per sumber
    rincian_sumber: dict = field(default_factory=dict)
    # Rincian grey WF per parameter
    grey_wf_detail: dict = field(default_factory=dict)
    # Intensitas
    intensitas_per_m2: Optional[float] = None  # WF per m² luas area
    intensitas_per_unit: Optional[float] = None  # WF per unit produksi

@dataclass
class HasilBebanPencemaran:
    """Hasil perhitungan beban pencemaran limbah cair"""
    tanggal_pengujian: date
    debit_m3_per_hari: float
    # Beban pencemaran (kg/hari)
    beban_bod: Optional[float] = None
    beban_cod: Optional[float] = None
    beban_tss: Optional[float] = None
    beban_oil_grease: Optional[float] = None
    beban_ammonia: Optional[float] = None
    # Rincian per parameter
    rincian: dict = field(default_factory=dict)

@dataclass
class StatusParameter:
    """Status kepatuhan satu parameter"""
    nama_parameter: str
    satuan: str
    nilai_aktual: float
    nilai_baku_mutu: float
    rasio: float                         # aktual / baku_mutu (%)
    status: StatusKepatuhan
    keterangan: str = ""

@dataclass
class HasilKepatuhan:
    """Hasil pengecekan kepatuhan terhadap baku mutu"""
    kelas_air: KelasAirBaku
    tanggal_pengujian: date
    status_keseluruhan: StatusKepatuhan
    parameter_list: list                 # List[StatusParameter]
    jumlah_compliant: int = 0
    jumlah_non_compliant: int = 0
    jumlah_warning: int = 0

@dataclass
class LaporanESG:
    """Laporan ESG lengkap untuk satu periode"""
    nama_perusahaan: str
    alamat: str
    sektor_industri: str
    periode_bulan: int
    periode_tahun: int
    # Komponen laporan
    jejak_air: Optional[HasilJejakAir] = None
    beban_pencemaran: Optional[list] = None  # List[HasilBebanPencemaran]
    kepatuhan: Optional[list] = None         # List[HasilKepatuhan]
    # Ringkasan GRI 303
    gri_303_3_withdrawal: dict = field(default_factory=dict)
    gri_303_4_discharge: dict = field(default_factory=dict)
    gri_303_5_consumption: float = 0.0
