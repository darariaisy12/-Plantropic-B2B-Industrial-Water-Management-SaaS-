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
  E1_SCORE_BEST_TCO2E,
  E1_SCORE_WORST_TCO2E,
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
 * Map total emissions to a 0..100 score. Lower emissions score higher: at or
 * below the BEST threshold → 100, at or above WORST → 0, linear in between.
 */
function scoreEmissions(totalTco2e: number): number {
  if (totalTco2e <= E1_SCORE_BEST_TCO2E) {
    return 100;
  }
  if (totalTco2e >= E1_SCORE_WORST_TCO2E) {
    return 0;
  }
  const span = E1_SCORE_WORST_TCO2E - E1_SCORE_BEST_TCO2E;
  const above = totalTco2e - E1_SCORE_BEST_TCO2E;
  return clamp(100 * (1 - above / span), 0, 100);
}

/** E1 — Greenhouse gas emissions (Scope 1 fuels + Scope 2 electricity). */
export function calculateE1(input: EsgInput): ElementScore {
  const scope1Tco2e = sumTco2e(input, SCOPE_1_FACTORS);
  const scope2Tco2e = sumTco2e(input, SCOPE_2_FACTORS);
  const totalTco2e = scope1Tco2e + scope2Tco2e;

  return {
    elementId: 'E1',
    score: round(scoreEmissions(totalTco2e), 1),
    detail: {
      scope1Tco2e: round(scope1Tco2e, 3),
      scope2Tco2e: round(scope2Tco2e, 3),
      totalTco2e: round(totalTco2e, 3),
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
