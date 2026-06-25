import { describe, expect, test } from 'vitest';
import { ESG_FRAMEWORK, getElement } from '../framework';
import type { ElementId, PillarId } from '../types';

const EXPECTED_IDS: ElementId[] = [
  'E1', 'E2', 'E3', 'E4', 'E5',
  'S1', 'S2', 'S3', 'S4', 'S5',
  'G1', 'G2', 'G3', 'G4',
];

const PILLAR_COUNTS: Record<PillarId, number> = { E: 5, S: 5, G: 4 };

describe('ESG framework integrity', () => {
  test('defines exactly the 14 expected elements', () => {
    const ids = ESG_FRAMEWORK.map((e) => e.id);
    expect(ids).toEqual(EXPECTED_IDS);
  });

  test('element ids are unique', () => {
    const ids = ESG_FRAMEWORK.map((e) => e.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  test('has the right number of elements per pillar', () => {
    const counts = ESG_FRAMEWORK.reduce<Record<string, number>>((acc, e) => {
      acc[e.pillar] = (acc[e.pillar] ?? 0) + 1;
      return acc;
    }, {});
    expect(counts).toEqual(PILLAR_COUNTS);
  });

  test('every element has a GRI anchor and at least one indicator', () => {
    for (const element of ESG_FRAMEWORK) {
      expect(element.griAnchor.length).toBeGreaterThan(0);
      expect(element.indicators.length).toBeGreaterThan(0);
    }
  });

  test('indicator ids are globally unique across the framework', () => {
    const indicatorIds = ESG_FRAMEWORK.flatMap((e) => e.indicators.map((i) => i.id));
    expect(new Set(indicatorIds).size).toBe(indicatorIds.length);
  });

  test('quantitative indicators declare a unit', () => {
    const quant = ESG_FRAMEWORK.flatMap((e) => e.indicators).filter(
      (i) => i.kind === 'quantitative',
    );
    expect(quant.length).toBeGreaterThan(0);
    for (const indicator of quant) {
      expect(indicator.kind === 'quantitative' && indicator.unit.length).toBeGreaterThan(0);
    }
  });

  test('qualitative indicators offer scored options within 0..100', () => {
    const qual = ESG_FRAMEWORK.flatMap((e) => e.indicators).filter(
      (i) => i.kind === 'qualitative',
    );
    expect(qual.length).toBeGreaterThan(0);
    for (const indicator of qual) {
      if (indicator.kind !== 'qualitative') continue;
      expect(indicator.options.length).toBeGreaterThanOrEqual(2);
      for (const option of indicator.options) {
        expect(option.score).toBeGreaterThanOrEqual(0);
        expect(option.score).toBeLessThanOrEqual(100);
      }
    }
  });
});

describe('getElement', () => {
  test('returns the matching element', () => {
    expect(getElement('E1').name).toBe('Emisi Gas Rumah Kaca');
  });

  test('throws on an unknown element id', () => {
    // @ts-expect-error testing invalid id at runtime
    expect(() => getElement('Z9')).toThrow('Unknown ESG element');
  });
});
