/**
 * Small numeric helpers shared across the ESG engine. Pure and dependency-free
 * so calculators, scoring, and aggregation all behave identically.
 */

/** Clamp a number into the inclusive [min, max] range. */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/** Round to `dp` decimal places, avoiding float display noise. */
export function round(value: number, dp: number): number {
  const factor = 10 ** dp;
  return Math.round(value * factor) / factor;
}

/** Arithmetic mean; returns 0 for an empty list. */
export function average(values: readonly number[]): number {
  if (values.length === 0) {
    return 0;
  }
  return values.reduce((acc, value) => acc + value, 0) / values.length;
}

/**
 * Coerce untrusted input into a non-negative finite number. Missing, NaN,
 * negative, or non-numeric values collapse to 0 so a partial assessment never
 * throws or produces a bogus negative metric.
 */
export function toNonNegativeNumber(value: unknown): number {
  const n = typeof value === 'string' ? Number(value) : value;
  if (typeof n !== 'number' || !Number.isFinite(n) || n < 0) {
    return 0;
  }
  return n;
}

/**
 * Score a percentage against a policy or best-practice benchmark: reaching the
 * target maps to 100, below it scales linearly, exceeding it is capped at 100
 * (not penalised). Returns 0 when targetPct is 0 or negative.
 */
export function scoreAgainstTarget(actualPct: number, targetPct: number): number {
  if (targetPct <= 0) return 0;
  return clamp((actualPct / targetPct) * 100, 0, 100);
}
