/**
 * Bridge between the wizard's form state and the engine's `EsgInput`.
 *
 * The form keeps every field as a string (that's what inputs/selects emit).
 * The engine wants numbers for quantitative indicators and the chosen option
 * label (a string) for qualitative ones. These helpers do that translation in
 * one place so the UI never has to reason about indicator kinds inline.
 */

import { ESG_FRAMEWORK } from './framework';
import type { EsgInput, PillarId, Weights } from './types';

/** Form state: indicator id -> raw string value. */
export type FormState = Record<string, string>;

const PILLARS: readonly PillarId[] = ['E', 'S', 'G'];

/** Every indicator id in the framework, flattened. */
export const ALL_INDICATOR_IDS: readonly string[] = ESG_FRAMEWORK.flatMap((element) =>
  element.indicators.map((indicator) => indicator.id),
);

/** A blank form: every indicator present with an empty value. */
export function emptyFormState(): FormState {
  return ALL_INDICATOR_IDS.reduce<FormState>((acc, id) => {
    acc[id] = '';
    return acc;
  }, {});
}

/** Map of indicator id -> the element (and pillar) it belongs to. */
const ELEMENT_BY_INDICATOR: Readonly<Record<string, { elementId: string; pillar: PillarId; elementName: string }>> =
  ESG_FRAMEWORK.flatMap((element) =>
    element.indicators.map((indicator) => ({
      indicatorId: indicator.id,
      elementId: element.id,
      pillar: element.pillar,
      elementName: element.name,
    })),
  ).reduce<Record<string, { elementId: string; pillar: PillarId; elementName: string }>>(
    (acc, { indicatorId, elementId, pillar, elementName }) => {
      acc[indicatorId] = { elementId, pillar, elementName };
      return acc;
    },
    {},
  );

export interface IncompleteElement {
  elementId: string;
  elementName: string;
  pillar: PillarId;
}

/**
 * Every E/S/G element that still has at least one blank indicator, in
 * framework order. Used to block submission until the assessment is complete
 * and to point the user at what's missing.
 */
export function findIncompleteElements(form: FormState): IncompleteElement[] {
  const seen = new Set<string>();
  const incomplete: IncompleteElement[] = [];
  for (const id of ALL_INDICATOR_IDS) {
    if (form[id] !== '' && form[id] !== undefined) {
      continue;
    }
    const meta = ELEMENT_BY_INDICATOR[id];
    if (!meta || seen.has(meta.elementId)) {
      continue;
    }
    seen.add(meta.elementId);
    incomplete.push({ elementId: meta.elementId, elementName: meta.elementName, pillar: meta.pillar });
  }
  return incomplete;
}

/** Map of indicator id -> kind, built once for the converter below. */
const INDICATOR_KIND: Readonly<Record<string, 'quantitative' | 'qualitative'>> =
  ESG_FRAMEWORK.flatMap((element) => element.indicators).reduce<
    Record<string, 'quantitative' | 'qualitative'>
  >((acc, indicator) => {
    acc[indicator.id] = indicator.kind;
    return acc;
  }, {});

/**
 * Convert form state into engine input. Quantitative blanks become 0 (the
 * engine already treats missing/invalid as 0); qualitative blanks are dropped
 * so the scorer falls back to its "unanswered" handling.
 */
export function toEsgInput(form: FormState): EsgInput {
  const input: Record<string, number | string> = {};
  for (const [id, raw] of Object.entries(form)) {
    const kind = INDICATOR_KIND[id];
    if (kind === 'quantitative') {
      const value = Number(raw);
      input[id] = Number.isFinite(value) ? value : 0;
    } else if (raw !== '') {
      input[id] = raw;
    }
  }
  return input;
}

/** Default weights: equal across pillars and elements (all 1, normalized later). */
export function defaultWeights(): Weights {
  return {
    pillars: PILLARS.reduce(
      (acc, pillar) => ({ ...acc, [pillar]: 1 }),
      {} as Record<PillarId, number>,
    ),
    elements: {},
  };
}
