/**
 * Quantitative calculators for the Environment pillar (E1–E4).
 *
 * Each calculator is a pure function: `EsgInput -> ElementScore`. It reads the
 * indicator values it needs, applies a deterministic formula, and returns a
 * 0..100 score plus an auditable `detail` breakdown. No I/O, no AI, no mutation.
 *
 * Qualitative indicators (e.g. E2's "B3 dikelola pihak berizin") are scored in
 * the scoring/aggregation layer, not here — these functions cover the numbers.
 */

import {
  EMISSION_FACTORS,
  SCOPE_1_FACTORS,
  SCOPE_2_FACTORS,
  E1_INTENSITY_BEST_TCO2E_PER_TON,
  E1_INTENSITY_WORST_TCO2E_PER_TON,
  E1_ABS_BEST_TCO2E,
  E1_ABS_WORST_TCO2E,
  E2_RECOVERY_TARGET_PCT,
  E3_RENEWABLE_TARGET_PCT,
  type EmissionFactorKey,
} from './emissionFactors';
import { clamp, round, toNonNegativeNumber } from './math';
import type { ElementScore, EsgInput } from './types';

const KG_PER_TON = 1000;

/** Read a non-negative finite indicator value, defaulting untrusted input to 0. */
function readNumber(input: EsgInput, key: string): number {
  return toNonNegativeNumber(input[key]);
}

/** Percentage `part / whole`, clamped to 0..100; 0 when `whole` is 0. */
function sharePct(part: number, whole: number): number {
  if (whole <= 0) {
    return 0;
  }
  return clamp((part / whole) * 100, 0, 100);
}

/**
 * Score a percentage against a national policy benchmark: reaching the
 * target maps to 100, below it scales linearly, exceeding it is capped at
 * 100 (not penalized).
 */
function scoreAgainstTarget(actualPct: number, targetPct: number): number {
  if (targetPct <= 0) {
    return 0;
  }
  return clamp((actualPct / targetPct) * 100, 0, 100);
}

/** Sum tonnes of CO2e for a set of emission-factor keys. */
function sumTco2e(input: EsgInput, keys: readonly EmissionFactorKey[]): number {
  const kg = keys.reduce((acc, key) => acc + readNumber(input, key) * EMISSION_FACTORS[key], 0);
  return kg / KG_PER_TON;
}

/**
 * Score by emission intensity (tCO2e per ton of output). Lower intensity →
 * higher score. At or below BEST → 100; at or above WORST → 0; linear between.
 * Preferred over absolute scoring because it normalises for company scale.
 */
function scoreByIntensity(intensityTco2ePerTon: number): number {
  if (intensityTco2ePerTon <= E1_INTENSITY_BEST_TCO2E_PER_TON) return 100;
  if (intensityTco2ePerTon >= E1_INTENSITY_WORST_TCO2E_PER_TON) return 0;
  const span = E1_INTENSITY_WORST_TCO2E_PER_TON - E1_INTENSITY_BEST_TCO2E_PER_TON;
  return clamp(100 * (1 - (intensityTco2ePerTon - E1_INTENSITY_BEST_TCO2E_PER_TON) / span), 0, 100);
}

/**
 * Fallback: score by absolute tCO2e when production output is unknown. Lower
 * absolute emissions → higher score. At or below BEST → 100; at or above
 * WORST → 0; linear between.
 */
function scoreAbsoluteEmissions(totalTco2e: number): number {
  if (totalTco2e <= E1_ABS_BEST_TCO2E) return 100;
  if (totalTco2e >= E1_ABS_WORST_TCO2E) return 0;
  const span = E1_ABS_WORST_TCO2E - E1_ABS_BEST_TCO2E;
  return clamp(100 * (1 - (totalTco2e - E1_ABS_BEST_TCO2E) / span), 0, 100);
}

/**
 * E1 — Greenhouse gas emissions (GRI 305, PP 98/2021, KLHK No. 21/2022).
 *
 * Scoring uses emission intensity (tCO2e per ton of production output) when
 * output is reported, because intensity normalises for company scale and is
 * the GRI 305-4 recommended disclosure. Falls back to absolute tCO2e if the
 * user does not report production output (shared field with E3).
 */
export function calculateE1(input: EsgInput): ElementScore {
  const scope1Tco2e = sumTco2e(input, SCOPE_1_FACTORS);
  const scope2Tco2e = sumTco2e(input, SCOPE_2_FACTORS);
  const totalTco2e = scope1Tco2e + scope2Tco2e;
  // production_output_ton is collected under the E3 indicators (shared field).
  const outputTon = toNonNegativeNumber(input['production_output_ton']);

  let score: number;
  let intensityTco2ePerTon: number | undefined;
  if (outputTon > 0) {
    intensityTco2ePerTon = totalTco2e / outputTon;
    score = scoreByIntensity(intensityTco2ePerTon);
  } else {
    score = scoreAbsoluteEmissions(totalTco2e);
  }

  return {
    elementId: 'E1',
    score: round(score, 1),
    detail: {
      scope1Tco2e: round(scope1Tco2e, 3),
      scope2Tco2e: round(scope2Tco2e, 3),
      totalTco2e: round(totalTco2e, 3),
      ...(intensityTco2ePerTon !== undefined && {
        intensityTco2ePerTon: round(intensityTco2ePerTon, 4),
      }),
    },
  };
}

/**
 * E2 — Solid waste recovery rate (recycled / total), scored against
 * Indonesia's Jakstranas national target (70% sampah tertangani by 2025,
 * Perpres No. 97/2017). See `E2_RECOVERY_TARGET_PCT`.
 */
export function calculateE2(input: EsgInput): ElementScore {
  const totalTon = readNumber(input, 'waste_total_ton');
  const recycledTon = readNumber(input, 'waste_recycled_ton');
  const b3Ton = readNumber(input, 'waste_b3_ton');
  const recoveryRatePct = sharePct(recycledTon, totalTon);

  return {
    elementId: 'E2',
    score: round(scoreAgainstTarget(recoveryRatePct, E2_RECOVERY_TARGET_PCT), 1),
    detail: {
      recoveryRatePct: round(recoveryRatePct, 2),
      totalTon: round(totalTon, 3),
      recycledTon: round(recycledTon, 3),
      b3Ton: round(b3Ton, 3),
    },
  };
}

/**
 * E3 — Energy use: renewable share, scored against Indonesia's RUEN/KEN
 * national target (23% renewable mix by 2030, Perpres No. 22/2017). See
 * `E3_RENEWABLE_TARGET_PCT`. Energy intensity is reported but not scored —
 * no cross-industry intensity benchmark was available at implementation time.
 */
export function calculateE3(input: EsgInput): ElementScore {
  const totalKwh = readNumber(input, 'energy_total_kwh');
  const renewableKwh = readNumber(input, 'renewable_kwh');
  const outputTon = readNumber(input, 'production_output_ton');
  const renewableSharePct = sharePct(renewableKwh, totalKwh);
  const energyIntensityKwhPerTon = outputTon > 0 ? totalKwh / outputTon : 0;

  return {
    elementId: 'E3',
    score: round(scoreAgainstTarget(renewableSharePct, E3_RENEWABLE_TARGET_PCT), 1),
    detail: {
      renewableSharePct: round(renewableSharePct, 2),
      energyIntensityKwhPerTon: round(energyIntensityKwhPerTon, 3),
      totalKwh: round(totalKwh, 3),
      renewableKwh: round(renewableKwh, 3),
    },
  };
}

/**
 * E4 — Raw materials: recycled content share, scored linearly (0% → 0,
 * 100% → 100). ⚠️ No Indonesia-specific or cross-industry recycled-content
 * benchmark was found at implementation time — unlike E2/E3, this is not yet
 * anchored to a national target. See circular economy literature in
 * `jurnal/E4_Bahan_Baku/` for context; treat the linear scale as a
 * placeholder pending a sector-specific benchmark.
 */
export function calculateE4(input: EsgInput): ElementScore {
  const totalTon = readNumber(input, 'material_total_ton');
  const recycledTon = readNumber(input, 'material_recycled_ton');
  const recycledSharePct = sharePct(recycledTon, totalTon);

  return {
    elementId: 'E4',
    score: round(recycledSharePct, 1),
    detail: {
      recycledSharePct: round(recycledSharePct, 2),
      totalTon: round(totalTon, 3),
      recycledTon: round(recycledTon, 3),
    },
  };
}
