/**
 * Weight normalization. The user supplies relative weights per pillar and
 * (optionally) per element; they need not sum to anything. This module turns
 * them into proportions that sum to 1 within each group, so aggregation is a
 * plain weighted average. Missing or non-positive weights fall back to a
 * neutral default, which yields equal weighting when nothing is provided.
 */

import { ESG_FRAMEWORK } from './framework';
import type { ElementId, PillarId, Weights } from './types';

export const DEFAULT_WEIGHT = 1;
const PILLARS: readonly PillarId[] = ['E', 'S', 'G'];

export interface NormalizedWeights {
  /** Pillar proportions; sum to 1 across E/S/G. */
  pillars: Record<PillarId, number>;
  /** Element proportions; sum to 1 within each pillar. */
  elements: Record<ElementId, number>;
}

/** A weight is only honoured when it is a finite positive number. */
function effectiveWeight(value: number | undefined): number {
  return typeof value === 'number' && Number.isFinite(value) && value > 0 ? value : DEFAULT_WEIGHT;
}

/** Convert raw weights for a group of ids into proportions summing to 1. */
function toProportions<Id extends string>(
  ids: readonly Id[],
  rawWeight: (id: Id) => number | undefined,
): Record<Id, number> {
  const weights = ids.map((id) => effectiveWeight(rawWeight(id)));
  const total = weights.reduce((acc, weight) => acc + weight, 0);
  const result = {} as Record<Id, number>;
  ids.forEach((id, index) => {
    result[id] = weights[index] / total;
  });
  return result;
}

export function normalizeWeights(weights: Weights): NormalizedWeights {
  const pillarWeights = weights.pillars ?? ({} as Record<PillarId, number>);
  const elementWeights = weights.elements ?? {};

  const pillars = toProportions(PILLARS, (pillar) => pillarWeights[pillar]);

  const elements = {} as Record<ElementId, number>;
  for (const pillar of PILLARS) {
    const ids = ESG_FRAMEWORK.filter((element) => element.pillar === pillar).map((e) => e.id);
    const proportions = toProportions(ids, (id) => elementWeights[id]);
    for (const id of ids) {
      elements[id] = proportions[id];
    }
  }

  return { pillars, elements };
}
