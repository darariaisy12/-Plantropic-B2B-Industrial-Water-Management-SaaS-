/**
 * Aggregation: roll the 14 element scores up into pillar scores and a single
 * overall ESG score, using the user's normalized weights. This is the engine's
 * public entry point — `computeEsg(input, weights)` is deterministic and the
 * only function the UI and AI layers need to call.
 */

import { ESG_FRAMEWORK } from './framework';
import { scoreElement } from './scoring';
import { normalizeWeights } from './weights';
import { round } from './math';
import type {
  ElementScore,
  EsgInput,
  EsgResult,
  PillarId,
  PillarScore,
  Weights,
} from './types';

const PILLARS: readonly PillarId[] = ['E', 'S', 'G'];

/** Score every element in the framework, in declaration order. */
export function scoreAllElements(input: EsgInput): ElementScore[] {
  return ESG_FRAMEWORK.map((element) => scoreElement(element.id, input));
}

/** Combine element scores into pillar scores and an overall score. */
export function aggregate(
  elementScores: readonly ElementScore[],
  weights: Weights,
): { overall: number; pillars: PillarScore[] } {
  const normalized = normalizeWeights(weights);
  const scoreById = new Map(elementScores.map((score) => [score.elementId, score.score]));

  const pillarRaw = PILLARS.map((pillar) => {
    const elementIds = ESG_FRAMEWORK.filter((e) => e.pillar === pillar).map((e) => e.id);
    const raw = elementIds.reduce(
      (acc, id) => acc + (scoreById.get(id) ?? 0) * normalized.elements[id],
      0,
    );
    return { pillar, raw };
  });

  const overall = pillarRaw.reduce(
    (acc, { pillar, raw }) => acc + raw * normalized.pillars[pillar],
    0,
  );

  const pillars: PillarScore[] = pillarRaw.map(({ pillar, raw }) => ({
    pillar,
    score: round(raw, 1),
  }));

  return { overall: round(overall, 1), pillars };
}

/** Deterministic top-level computation: raw input + weights → full ESG result. */
export function computeEsg(input: EsgInput, weights: Weights): EsgResult {
  const elements = scoreAllElements(input);
  const { overall, pillars } = aggregate(elements, weights);
  return { overall, pillars, elements };
}
