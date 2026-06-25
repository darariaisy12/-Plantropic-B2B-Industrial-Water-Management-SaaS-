import { describe, expect, test } from 'vitest';
import {
  EMISSION_FACTORS,
  E1_SCORE_BEST_TCO2E,
  E1_SCORE_WORST_TCO2E,
} from '../emissionFactors';
import {
  calculateE1,
  calculateE2,
  calculateE3,
  calculateE4,
} from '../calculators';
import type { EsgInput } from '../types';

describe('emission factors', () => {
  test('all factors are positive and finite', () => {
    for (const factor of Object.values(EMISSION_FACTORS)) {
      expect(Number.isFinite(factor)).toBe(true);
      expect(factor).toBeGreaterThan(0);
    }
  });

  test('factors sit within plausible kgCO2e ranges', () => {
    // Grid electricity ~0.5–1.0, fuels ~1.8–3.0 per their natural unit.
    expect(EMISSION_FACTORS.electricity_kwh).toBeGreaterThan(0.4);
    expect(EMISSION_FACTORS.electricity_kwh).toBeLessThan(1.2);
    expect(EMISSION_FACTORS.diesel_l).toBeGreaterThan(2);
    expect(EMISSION_FACTORS.gasoline_l).toBeGreaterThan(2);
    expect(EMISSION_FACTORS.natural_gas_m3).toBeGreaterThan(1);
  });
});

describe('calculateE1 — GHG emissions', () => {
  test('splits Scope 1 (fuels) and Scope 2 (electricity)', () => {
    const input: EsgInput = {
      electricity_kwh: 1000,
      diesel_l: 100,
      gasoline_l: 0,
      natural_gas_m3: 0,
    };
    const result = calculateE1(input);

    const expectedScope2 = (1000 * EMISSION_FACTORS.electricity_kwh) / 1000;
    const expectedScope1 = (100 * EMISSION_FACTORS.diesel_l) / 1000;

    expect(result.elementId).toBe('E1');
    expect(result.detail?.scope2Tco2e).toBeCloseTo(expectedScope2, 3);
    expect(result.detail?.scope1Tco2e).toBeCloseTo(expectedScope1, 3);
    expect(result.detail?.totalTco2e).toBeCloseTo(expectedScope1 + expectedScope2, 3);
  });

  test('zero emissions earns the best score', () => {
    const input: EsgInput = {
      electricity_kwh: 0,
      diesel_l: 0,
      gasoline_l: 0,
      natural_gas_m3: 0,
    };
    expect(calculateE1(input).score).toBe(100);
  });

  test('emissions at or beyond the worst threshold floor the score at 0', () => {
    const tonsOfDiesel = (E1_SCORE_WORST_TCO2E * 1000 * 1000) / EMISSION_FACTORS.diesel_l;
    const input: EsgInput = { diesel_l: tonsOfDiesel };
    expect(calculateE1(input).score).toBe(0);
  });

  test('score decreases monotonically as emissions rise', () => {
    const low = calculateE1({ electricity_kwh: 10_000 }).score;
    const high = calculateE1({ electricity_kwh: 500_000 }).score;
    expect(high).toBeLessThan(low);
  });

  test('best threshold is below the worst threshold', () => {
    expect(E1_SCORE_BEST_TCO2E).toBeLessThan(E1_SCORE_WORST_TCO2E);
  });

  test('treats missing and negative inputs as zero', () => {
    const result = calculateE1({ electricity_kwh: -5 } as unknown as EsgInput);
    expect(result.detail?.totalTco2e).toBe(0);
    expect(result.score).toBe(100);
  });
});

describe('calculateE2 — solid waste recovery', () => {
  test('recovery rate is recycled / total as a percentage', () => {
    const result = calculateE2({ waste_total_ton: 200, waste_recycled_ton: 50, waste_b3_ton: 10 });
    expect(result.elementId).toBe('E2');
    expect(result.detail?.recoveryRatePct).toBeCloseTo(25, 3);
    expect(result.score).toBeCloseTo(25, 3);
    expect(result.detail?.b3Ton).toBe(10);
  });

  test('full recovery scores 100', () => {
    expect(calculateE2({ waste_total_ton: 80, waste_recycled_ton: 80 }).score).toBe(100);
  });

  test('zero total waste yields a zero rate without dividing by zero', () => {
    const result = calculateE2({ waste_total_ton: 0, waste_recycled_ton: 0 });
    expect(result.detail?.recoveryRatePct).toBe(0);
    expect(result.score).toBe(0);
  });

  test('recycled above total is clamped to 100', () => {
    expect(calculateE2({ waste_total_ton: 10, waste_recycled_ton: 999 }).score).toBe(100);
  });
});

describe('calculateE3 — energy use', () => {
  test('score is the renewable share of total energy', () => {
    const result = calculateE3({
      energy_total_kwh: 1000,
      renewable_kwh: 300,
      production_output_ton: 50,
    });
    expect(result.elementId).toBe('E3');
    expect(result.detail?.renewableSharePct).toBeCloseTo(30, 3);
    expect(result.score).toBeCloseTo(30, 3);
  });

  test('reports energy intensity per unit output', () => {
    const result = calculateE3({
      energy_total_kwh: 1000,
      renewable_kwh: 0,
      production_output_ton: 50,
    });
    expect(result.detail?.energyIntensityKwhPerTon).toBeCloseTo(20, 3);
  });

  test('zero output avoids divide-by-zero intensity', () => {
    const result = calculateE3({ energy_total_kwh: 1000, production_output_ton: 0 });
    expect(result.detail?.energyIntensityKwhPerTon).toBe(0);
  });
});

describe('calculateE4 — raw materials', () => {
  test('score is the recycled content share', () => {
    const result = calculateE4({ material_total_ton: 400, material_recycled_ton: 100 });
    expect(result.elementId).toBe('E4');
    expect(result.detail?.recycledSharePct).toBeCloseTo(25, 3);
    expect(result.score).toBeCloseTo(25, 3);
  });

  test('zero materials yields zero share', () => {
    expect(calculateE4({ material_total_ton: 0 }).score).toBe(0);
  });
});
