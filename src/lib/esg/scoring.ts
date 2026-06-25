/**
 * Per-element scoring: turns raw input into a 0..100 `ElementScore` for each of
 * the 14 ESG elements. Quantitative Environment elements (E1–E4) delegate to
 * the calculators; the rest are scored here from qualitative options, percentage
 * indicators, and a couple of rate/count bands.
 *
 * ⚠️ The Social/Governance thresholds below are DRAFT — indicative, not audited,
 * and easy to tune once domain validation lands.
 */

import { average, clamp, round, toNonNegativeNumber } from './math';
import { getElement } from './framework';
import { calculateE1, calculateE2, calculateE3, calculateE4 } from './calculators';
import type { ElementId, ElementScore, EsgInput } from './types';

/** Lost-time injury frequency rate (per 1,000,000 hours) that scores 0. DRAFT. */
const LTIFR_WORST = 20;
const HOURS_PER_MILLION = 1_000_000;
/** Legal-violation count that floors the sub-score at 0. DRAFT. */
const LEGAL_VIOLATIONS_WORST = 5;

/** Look up the maturity/option score the user selected for a qualitative indicator. */
function scoreQualitative(elementId: ElementId, indicatorId: string, input: EsgInput): number {
  const indicator = getElement(elementId).indicators.find((i) => i.id === indicatorId);
  if (!indicator || indicator.kind !== 'qualitative') {
    return 0;
  }
  const chosen = indicator.options.find((option) => option.label === input[indicatorId]);
  return chosen ? chosen.score : 0;
}

/** A percentage indicator is already on a 0..100 scale; just clamp it. */
function percentScore(input: EsgInput, key: string): number {
  return clamp(toNonNegativeNumber(input[key]), 0, 100);
}

/**
 * Lower-is-better band: at or below `bestAt` → 100, at or above `worstAt` → 0,
 * linear in between. Used for injury rates and violation counts.
 */
function descendingBand(value: number, bestAt: number, worstAt: number): number {
  if (value <= bestAt) {
    return 100;
  }
  if (value >= worstAt) {
    return 0;
  }
  return clamp(100 * (1 - (value - bestAt) / (worstAt - bestAt)), 0, 100);
}

const composite = (elementId: ElementId, parts: number[]): ElementScore => ({
  elementId,
  score: round(average(parts), 1),
});

/** E2 — quantitative recovery blended with the B3-handling disclosure. */
function scoreE2(input: EsgInput): ElementScore {
  const recovery = calculateE2(input);
  const b3 = scoreQualitative('E2', 'b3_licensed_handler', input);
  return {
    elementId: 'E2',
    score: round(average([recovery.score, b3]), 1),
    detail: recovery.detail,
  };
}

/** E5 — air pollution monitoring + compliance disclosures. */
function scoreE5(input: EsgInput): ElementScore {
  return composite('E5', [
    scoreQualitative('E5', 'emission_monitoring', input),
    scoreQualitative('E5', 'air_quality_compliance', input),
  ]);
}

/** S1 — occupational safety: injury frequency rate + K3 management maturity. */
function scoreS1(input: EsgInput): ElementScore {
  const accidents = toNonNegativeNumber(input['accidents_count']);
  const workhours = toNonNegativeNumber(input['workhours_total']);
  const k3 = scoreQualitative('S1', 'k3_management_system', input);

  const parts = [k3];
  let ltifr = 0;
  if (workhours > 0) {
    ltifr = (accidents / workhours) * HOURS_PER_MILLION;
    parts.push(descendingBand(ltifr, 0, LTIFR_WORST));
  } else if (accidents > 0) {
    // Accidents reported without hours: can't rate it, treat as unsafe.
    parts.push(0);
  }

  return {
    elementId: 'S1',
    score: round(average(parts), 1),
    detail: { ltifr: round(ltifr, 2), accidents, workhours },
  };
}

/** S2 — labour rights: average of the three yes/no disclosures. */
function scoreS2(input: EsgInput): ElementScore {
  return composite('S2', [
    scoreQualitative('S2', 'no_child_labor', input),
    scoreQualitative('S2', 'freedom_of_association', input),
    scoreQualitative('S2', 'min_wage_compliance', input),
  ]);
}

/** S3 — diversity: average of the two participation percentages. */
function scoreS3(input: EsgInput): ElementScore {
  return composite('S3', [
    percentScore(input, 'women_workforce_pct'),
    percentScore(input, 'women_management_pct'),
  ]);
}

/** S4 — community: empowerment programme maturity + grievance mechanism. */
function scoreS4(input: EsgInput): ElementScore {
  return composite('S4', [
    scoreQualitative('S4', 'community_program', input),
    scoreQualitative('S4', 'grievance_mechanism', input),
  ]);
}

/** S5 — customers: satisfaction percentage + complaint-handling maturity. */
function scoreS5(input: EsgInput): ElementScore {
  return composite('S5', [
    percentScore(input, 'customer_satisfaction_pct'),
    scoreQualitative('S5', 'complaint_handling_system', input),
  ]);
}

/** G1 — ethics: code of conduct maturity + board independence. */
function scoreG1(input: EsgInput): ElementScore {
  return composite('G1', [
    scoreQualitative('G1', 'code_of_conduct', input),
    scoreQualitative('G1', 'board_independence', input),
  ]);
}

/** G2 — anti-corruption: policy maturity + training coverage percentage. */
function scoreG2(input: EsgInput): ElementScore {
  return composite('G2', [
    scoreQualitative('G2', 'anticorruption_policy', input),
    percentScore(input, 'anticorruption_training_pct'),
  ]);
}

/** G3 — legal compliance: violation count band + compliance management maturity. */
function scoreG3(input: EsgInput): ElementScore {
  const violations = toNonNegativeNumber(input['legal_violations_count']);
  const compliance = scoreQualitative('G3', 'compliance_management', input);
  return {
    elementId: 'G3',
    score: round(average([descendingBand(violations, 0, LEGAL_VIOLATIONS_WORST), compliance]), 1),
    detail: { legalViolations: violations },
  };
}

/** G4 — risk: risk management maturity + climate risk assessment. */
function scoreG4(input: EsgInput): ElementScore {
  return composite('G4', [
    scoreQualitative('G4', 'risk_management_system', input),
    scoreQualitative('G4', 'climate_risk_assessment', input),
  ]);
}

/** Registry mapping every element id to its scorer. */
const ELEMENT_SCORERS: Record<ElementId, (input: EsgInput) => ElementScore> = {
  E1: calculateE1,
  E2: scoreE2,
  E3: calculateE3,
  E4: calculateE4,
  E5: scoreE5,
  S1: scoreS1,
  S2: scoreS2,
  S3: scoreS3,
  S4: scoreS4,
  S5: scoreS5,
  G1: scoreG1,
  G2: scoreG2,
  G3: scoreG3,
  G4: scoreG4,
};

/** Score a single element from raw input. */
export function scoreElement(elementId: ElementId, input: EsgInput): ElementScore {
  return ELEMENT_SCORERS[elementId](input);
}
