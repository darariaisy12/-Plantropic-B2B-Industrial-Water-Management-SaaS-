"""
Water ESG Engine — Sistem Perhitungan Jejak Air & Limbah Cair
==============================================================
Sesuai standar:
- ISO 14046:2014 (Water Footprint)
- GRI 303:2018 (Water and Effluents)
- PP 82/2001 & PP 22/2021 (Regulasi KLHK Indonesia)
"""

from models.water_data import *
from calculators.water_footprint import WaterFootprintCalculator
from calculators.waste_load import WasteLoadCalculator
from calculators.compliance import ComplianceChecker
from reports.report_generator import ReportGenerator
from validators.input_validator import InputValidator

__version__ = "1.0.0"
__all__ = [
    "WaterFootprintCalculator",
    "WasteLoadCalculator",
    "ComplianceChecker",
    "ReportGenerator",
    "InputValidator",
]
