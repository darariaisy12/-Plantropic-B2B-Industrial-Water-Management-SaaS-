/**
 * Emission factors and quantitative scoring thresholds for the ESG engine.
 *
 * Every factor is a published reference figure; units are stated on each
 * constant. The engine output is auditable because these factors live here as
 * named, cited constants rather than being buried in the calculators.
 *
 * Sources:
 *  - Electricity: Indonesia interconnected (Jamali/PLN) grid emission factor,
 *    Kementerian ESDM / IESR (2023), 0.794 kgCO2e/kWh (Scope 2, location-based).
 *  - Diesel/Gasoline/Natural gas: UK DEFRA/BEIS GHG Conversion Factors (2023)
 *    and IPCC 2006 Guidelines Ch. 2 (Scope 1, stationary combustion).
 *
 * Units: kgCO2e per the indicator's natural unit (kWh, litre, m³).
 */

export const EMISSION_FACTORS = {
  /** kgCO2e per kWh — Indonesia PLN grid, Scope 2 (ESDM/IESR 2023). */
  electricity_kwh: 0.794,
  /** kgCO2e per litre — diesel/solar combustion, Scope 1 (DEFRA 2023). */
  diesel_l: 2.68,
  /** kgCO2e per litre — gasoline/bensin combustion, Scope 1 (DEFRA 2023). */
  gasoline_l: 2.31,
  /** kgCO2e per m³ — natural gas combustion, Scope 1 (IPCC 2006). */
  natural_gas_m3: 2.02,
} as const;

export type EmissionFactorKey = keyof typeof EMISSION_FACTORS;

/** Fuel inputs that contribute to Scope 1 (direct combustion). */
export const SCOPE_1_FACTORS: readonly EmissionFactorKey[] = [
  'diesel_l',
  'gasoline_l',
  'natural_gas_m3',
];

/** Inputs that contribute to Scope 2 (purchased electricity). */
export const SCOPE_2_FACTORS: readonly EmissionFactorKey[] = ['electricity_kwh'];

/**
 * E1 primary scoring — emission intensity band (tCO2e per ton of production
 * output). Intensity normalises for company size, making scores comparable
 * across companies regardless of scale.
 *
 * Thresholds (DRAFT — cross-sector indicative, not yet per-sector):
 *  ≤ 0.5 tCO2e/ton  → 100  (best-practice range; cement best-in-class ≈0.4)
 *  ≥ 5.0 tCO2e/ton  →   0  (high-intensity range; primary aluminium ≈12)
 *
 * Regulatory context: PP 98/2021 (KLHK Reg No. 21/2022) on carbon economic
 * value (NEK) and Indonesia ETS (Sistem Perdagangan Karbon) require large
 * industrial emitters to report and reduce Scope 1+2 intensity. The GRI 305
 * disclosure framework recommends intensity in tCO2e/unit of output.
 *
 * ⚠️ Replace with per-sector benchmarks (e.g., cement vs. textiles vs. pulp)
 * once sector-level data from KLHK/IDX ESG surveys is available.
 */
export const E1_INTENSITY_BEST_TCO2E_PER_TON = 0.5;
export const E1_INTENSITY_WORST_TCO2E_PER_TON = 5.0;

/**
 * E1 fallback — absolute tCO2e band used only when production output is not
 * reported (so intensity cannot be computed). ⚠️ DRAFT — sized for a small to
 * medium industrial site; does not normalise for company scale. Prefer the
 * intensity-based approach above wherever production output is available.
 */
export const E1_ABS_BEST_TCO2E = 50;
export const E1_ABS_WORST_TCO2E = 1000;

/**
 * E2 waste-recovery benchmark: Indonesia's national target under Jakstranas
 * (Strategi Nasional Pengelolaan Sampah, Perpres No. 97/2017) is 70% sampah
 * tertangani (handled/recovered) by 2025. Reaching this target maps to a
 * score of 100; below it scales linearly. Note: Jakstranas targets municipal
 * waste, not industrial waste specifically — used here as the best available
 * national policy anchor. Industrial B3 waste is governed separately under
 * PP 22/2021 and handled by licensed third parties (captured as a qualitative
 * disclosure in the engine).
 */
export const E2_RECOVERY_TARGET_PCT = 70;

/**
 * E3 renewable-energy benchmark: Indonesia's RUEN/KEN (Kebijakan Energi
 * Nasional, Peraturan Presiden No. 22/2017) targets a 23% renewable energy
 * mix by 2030. Reaching this share maps to a score of 100; below it scales
 * linearly. A company exceeding the national target is capped at 100 (not
 * penalised). Permen ESDM No. 26/2021 sets feed-in tariffs for rooftop solar,
 * creating a pathway for industrial users to self-generate renewables.
 */
export const E3_RENEWABLE_TARGET_PCT = 23;

/**
 * S3 women in workforce benchmark: BPS (Badan Pusat Statistik) Statistik
 * Gender Tematik (2023) reports approximately 38% female participation in
 * Indonesia's formal sector. Reaching this share maps to a score of 100;
 * exceeding it is capped at 100 (not penalised).
 *
 * Reference: BPS (2023). Statistik Gender Tematik: Potret Perempuan
 * Indonesia 2023. Jakarta: Badan Pusat Statistik.
 */
export const S3_WOMEN_WORKFORCE_TARGET_PCT = 38;

/**
 * S3 women in management benchmark: 30% women in senior or management
 * positions, as recommended by GRI 405-1 (2021) best practice and the
 * UN Women HeForShe framework. Also endorsed by Nicolò et al. (2021) as a
 * meaningful gender inclusion indicator in sustainability reporting.
 * POJK 51/2017 Lampiran II identifies gender composition in management
 * as a key sustainability disclosure metric.
 *
 * Reference: GRI 405-1 (2021); Nicolò et al. (2021) doi:10.1108/jaar-04-2021-0100.
 */
export const S3_WOMEN_MANAGEMENT_TARGET_PCT = 30;

/**
 * E1 per-sector emission intensity benchmarks (tCO2e per ton of production
 * output or per m³ for water sector). `best` → score 100; `worst` → 0;
 * linear between. Keys match the dropdown options in SettingsView.
 *
 * Sources: IEA Industry Data 2023, IEA Net Zero by 2050 Sector Deep-Dives,
 * published sustainability reports of Indonesian industrial issuers.
 *
 * Water/wastewater: tCO2e per m³ treated (1 m³ ≈ 1 metric ton). Based on
 * WHO (2017) Water & Climate Change: energy use 0.3–2.0 kWh/m³ × PLN factor.
 */
export interface SectorBenchmark {
  best: number;
  worst: number;
  label: string;
}

export const SECTOR_INTENSITY_BENCHMARKS: Readonly<Record<string, SectorBenchmark>> = {
  semen: {
    best: 0.4,
    worst: 1.0,
    label: 'Semen & Material Bangunan',
  },
  tekstil: {
    best: 0.5,
    worst: 3.0,
    label: 'Tekstil & Garmen',
  },
  makanan_minuman: {
    best: 0.1,
    worst: 1.5,
    label: 'Makanan & Minuman',
  },
  pulp_kertas: {
    best: 0.3,
    worst: 1.5,
    label: 'Pulp & Kertas',
  },
  baja_logam: {
    best: 0.5,
    worst: 3.0,
    label: 'Baja & Logam',
  },
  kimia: {
    best: 0.5,
    worst: 4.0,
    label: 'Kimia & Petrokimia',
  },
  otomotif: {
    best: 0.1,
    worst: 1.5,
    label: 'Otomotif & Perakitan',
  },
  pengolahan_air: {
    best: 0.0003,
    worst: 0.002,
    label: 'Pengolahan Air & Limbah Cair',
  },
  pertambangan: {
    best: 0.5,
    worst: 5.0,
    label: 'Pertambangan & Galian',
  },
  lainnya: {
    best: E1_INTENSITY_BEST_TCO2E_PER_TON,
    worst: E1_INTENSITY_WORST_TCO2E_PER_TON,
    label: 'Industri Lainnya',
  },
};

/** Ordered list of sector keys for the Settings dropdown. */
export const SECTOR_KEYS = Object.keys(SECTOR_INTENSITY_BENCHMARKS) as readonly string[];
