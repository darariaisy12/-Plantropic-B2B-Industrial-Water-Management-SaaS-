/**
 * Core domain types for the Plantropic ESG engine.
 *
 * The engine is pure and deterministic: given the same input and weights it
 * always returns the same result. It performs no I/O, no persistence, and no
 * AI calls — those live in separate layers (Supabase, /api/insight).
 */

export type PillarId = 'E' | 'S' | 'G';

export type ElementId =
  | 'E1' | 'E2' | 'E3' | 'E4' | 'E5'
  | 'S1' | 'S2' | 'S3' | 'S4' | 'S5'
  | 'G1' | 'G2' | 'G3' | 'G4';

/** A numeric data point the user reports (activity data, ratios, counts). */
export interface QuantitativeIndicator {
  id: string;
  label: string;
  kind: 'quantitative';
  unit: string;
}

/** A single answer choice for a qualitative indicator and its maturity score. */
export interface QualitativeOption {
  label: string;
  /** Maturity contribution on a 0..100 scale. */
  score: number;
}

/** A disclosure/maturity question scored from a fixed set of answers. */
export interface QualitativeIndicator {
  id: string;
  label: string;
  kind: 'qualitative';
  options: QualitativeOption[];
}

export type Indicator = QuantitativeIndicator | QualitativeIndicator;

/** Definition of one of the 14 ESG elements, anchored to a GRI standard. */
export interface ElementDefinition {
  id: ElementId;
  pillar: PillarId;
  name: string;
  /** Reporting standard this element is anchored to, e.g. 'GRI 305'. */
  griAnchor: string;
  /** Optional Indonesian regulation reference, e.g. 'PP 22/2021'. */
  regulation?: string;
  indicators: Indicator[];
}

/**
 * Raw user input, keyed by indicator id. Numbers for quantitative indicators,
 * option label for qualitative ones. Boundary validation runs before this.
 */
export type IndicatorValue = number | string;
export type EsgInput = Readonly<Record<string, IndicatorValue>>;

/**
 * Relative weights chosen by the user. Values are normalized at compute time,
 * so they need not sum to any particular total. Missing element weights
 * default to equal weighting within their pillar.
 */
export interface Weights {
  pillars: Record<PillarId, number>;
  elements: Partial<Record<ElementId, number>>;
}

export interface ElementScore {
  elementId: ElementId;
  score: number; // 0..100
  /** Engine-computed intermediate values, e.g. { tco2e: 462 }. */
  detail?: Readonly<Record<string, number>>;
}

export interface PillarScore {
  pillar: PillarId;
  score: number; // 0..100
}

export interface EsgResult {
  overall: number; // 0..100
  pillars: readonly PillarScore[];
  elements: readonly ElementScore[];
}
