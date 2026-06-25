/**
 * Emission factors and quantitative scoring thresholds for the ESG engine.
 *
 * ⚠️ DRAFT VALUES — indicative, not audited. Every factor below is a published
 * public reference figure and is intentionally easy to tune. The engine output
 * is auditable because the factors live here as named, cited constants rather
 * than being buried in the calculators.
 *
 * Sources:
 *  - Electricity: Indonesia interconnected (Jamali) grid emission factor,
 *    Kementerian ESDM / IESR, ≈0.79 kgCO2e/kWh (Scope 2, location-based).
 *  - Diesel/Gasoline/Natural gas: UK DEFRA/BEIS GHG conversion factors and
 *    IPCC 2006 Guidelines (Scope 1, combustion).
 *
 * Units: kgCO2e per the indicator's natural unit (kWh, litre, m³).
 */

export const EMISSION_FACTORS = {
  /** kgCO2e per kWh — Indonesia grid (Scope 2). DRAFT. */
  electricity_kwh: 0.794,
  /** kgCO2e per litre — diesel/solar combustion (Scope 1). DRAFT. */
  diesel_l: 2.68,
  /** kgCO2e per litre — gasoline/bensin combustion (Scope 1). DRAFT. */
  gasoline_l: 2.31,
  /** kgCO2e per m³ — natural gas combustion (Scope 1). DRAFT. */
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
 * E1 score band (tCO2e/year). At or below BEST → 100; at or above WORST → 0;
 * linear in between. ⚠️ DRAFT placeholders sized for a small–mid industrial
 * site. No universal cross-industry absolute tCO2e threshold exists in public
 * literature — emission scale is inherently a function of company size and
 * sector, so this should be replaced with a per-industry emission-intensity
 * benchmark (tCO2e per ton output) once that data is sourced, rather than an
 * absolute company-wide cutoff. Tune per company scale until then.
 */
export const E1_SCORE_BEST_TCO2E = 50;
export const E1_SCORE_WORST_TCO2E = 1000;

/**
 * E2 waste-recovery benchmark: Indonesia's national target under Jakstranas
 * (Strategi Nasional Pengelolaan Sampah, Perpres No. 97/2017) is 70% sampah
 * tertangani (handled/recovered) by 2025. Reaching this target maps to a
 * score of 100; below it scales linearly. DRAFT in the sense that Jakstranas
 * targets municipal waste, not industrial waste specifically — used here as
 * the best available national policy anchor.
 */
export const E2_RECOVERY_TARGET_PCT = 70;

/**
 * E3 renewable-energy benchmark: Indonesia's RUEN/KEN (Kebijakan Energi
 * Nasional, Peraturan Presiden No. 22/2017) targets a 23% renewable energy
 * mix by 2030. Reaching this share maps to a score of 100; below it scales
 * linearly. A company exceeding the national target is not penalized further.
 */
export const E3_RENEWABLE_TARGET_PCT = 23;
