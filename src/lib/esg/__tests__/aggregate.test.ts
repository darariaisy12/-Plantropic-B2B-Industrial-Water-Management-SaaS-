import { describe, expect, test } from 'vitest';
import { normalizeWeights } from '../weights';
import { computeEsg } from '../aggregate';
import type { ElementId, EsgInput, Weights } from '../types';

const EQUAL: Weights = { pillars: { E: 1, S: 1, G: 1 }, elements: {} };

/** An assessment where every one of the 14 elements scores 100. */
const PERFECT: EsgInput = {
  // E1 — no fuel/electricity reported → zero emissions → 100
  // E2
  waste_total_ton: 100,
  waste_recycled_ton: 100,
  b3_licensed_handler: 'Ya',
  // E3
  energy_total_kwh: 100,
  renewable_kwh: 100,
  production_output_ton: 10,
  // E4
  material_total_ton: 100,
  material_recycled_ton: 100,
  // E5
  emission_monitoring: 'Lengkap & terdokumentasi',
  air_quality_compliance: 'Ya',
  // S1
  accidents_count: 0,
  workhours_total: 1_000_000,
  k3_management_system: 'Lengkap & terdokumentasi',
  // S2
  no_child_labor: 'Ya',
  freedom_of_association: 'Ya',
  min_wage_compliance: 'Ya',
  // S3
  women_workforce_pct: 100,
  women_management_pct: 100,
  // S4
  community_program: 'Lengkap & terdokumentasi',
  grievance_mechanism: 'Ya',
  // S5
  customer_satisfaction_pct: 100,
  complaint_handling_system: 'Lengkap & terdokumentasi',
  // G1
  code_of_conduct: 'Lengkap & terdokumentasi',
  board_independence: 'Ya',
  // G2
  anticorruption_policy: 'Lengkap & terdokumentasi',
  anticorruption_training_pct: 100,
  // G3
  legal_violations_count: 0,
  compliance_management: 'Lengkap & terdokumentasi',
  // G4
  risk_management_system: 'Lengkap & terdokumentasi',
  climate_risk_assessment: 'Ya',
};

describe('normalizeWeights', () => {
  test('defaults to equal weighting that sums to 1 per group', () => {
    const n = normalizeWeights(EQUAL);
    expect(n.pillars.E + n.pillars.S + n.pillars.G).toBeCloseTo(1, 6);

    const envIds: ElementId[] = ['E1', 'E2', 'E3', 'E4', 'E5'];
    const envSum = envIds.reduce((acc, id) => acc + n.elements[id], 0);
    expect(envSum).toBeCloseTo(1, 6);
    expect(n.elements.E1).toBeCloseTo(0.2, 6);
  });

  test('non-positive or missing weights fall back to the default', () => {
    const n = normalizeWeights({ pillars: { E: 0, S: 0, G: 0 }, elements: {} });
    expect(n.pillars.E).toBeCloseTo(1 / 3, 6);
  });

  test('a heavier pillar weight takes a larger share', () => {
    const n = normalizeWeights({ pillars: { E: 2, S: 1, G: 1 }, elements: {} });
    expect(n.pillars.E).toBeCloseTo(0.5, 6);
  });
});

describe('computeEsg', () => {
  test('returns 14 element scores and 3 pillar scores', () => {
    const result = computeEsg({}, EQUAL);
    expect(result.elements).toHaveLength(14);
    expect(result.pillars).toHaveLength(3);
  });

  test('overall and pillar scores stay within 0..100', () => {
    const result = computeEsg(PERFECT, EQUAL);
    expect(result.overall).toBeGreaterThanOrEqual(0);
    expect(result.overall).toBeLessThanOrEqual(100);
    for (const pillar of result.pillars) {
      expect(pillar.score).toBeGreaterThanOrEqual(0);
      expect(pillar.score).toBeLessThanOrEqual(100);
    }
  });

  test('a fully strong assessment scores 100 overall', () => {
    expect(computeEsg(PERFECT, EQUAL).overall).toBe(100);
  });

  test('weighting away from a weak pillar raises the overall score', () => {
    // Make the Environment pillar weak via huge E1 emissions.
    const weakEnv: EsgInput = { ...PERFECT, electricity_kwh: 5_000_000 };
    const balanced = computeEsg(weakEnv, EQUAL).overall;
    const tilted = computeEsg(weakEnv, {
      pillars: { E: 0.01, S: 1, G: 1 },
      elements: {},
    }).overall;
    expect(tilted).toBeGreaterThan(balanced);
  });
});
