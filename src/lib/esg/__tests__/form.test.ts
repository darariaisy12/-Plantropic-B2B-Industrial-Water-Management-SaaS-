import { describe, expect, test } from 'vitest';
import { ESG_FRAMEWORK } from '../framework';
import {
  ALL_INDICATOR_IDS,
  emptyFormState,
  toEsgInput,
  defaultWeights,
  findIncompleteElements,
} from '../form';

describe('emptyFormState', () => {
  test('contains every indicator id with an empty string', () => {
    const state = emptyFormState();
    expect(Object.keys(state)).toHaveLength(ALL_INDICATOR_IDS.length);
    expect(Object.values(state).every((value) => value === '')).toBe(true);
  });
});

describe('toEsgInput', () => {
  test('parses quantitative fields to numbers', () => {
    const input = toEsgInput({ ...emptyFormState(), electricity_kwh: '1500' });
    expect(input.electricity_kwh).toBe(1500);
  });

  test('blank quantitative field becomes 0', () => {
    const input = toEsgInput(emptyFormState());
    expect(input.electricity_kwh).toBe(0);
  });

  test('non-numeric quantitative input falls back to 0', () => {
    const input = toEsgInput({ ...emptyFormState(), diesel_l: 'abc' });
    expect(input.diesel_l).toBe(0);
  });

  test('keeps qualitative answer as its option label', () => {
    const input = toEsgInput({ ...emptyFormState(), b3_licensed_handler: 'Ya' });
    expect(input.b3_licensed_handler).toBe('Ya');
  });

  test('drops unanswered qualitative fields', () => {
    const input = toEsgInput(emptyFormState());
    expect('b3_licensed_handler' in input).toBe(false);
  });
});

describe('defaultWeights', () => {
  test('weights every pillar equally with no element overrides', () => {
    const weights = defaultWeights();
    expect(weights.pillars).toEqual({ E: 1, S: 1, G: 1 });
    expect(weights.elements).toEqual({});
  });
});

describe('ALL_INDICATOR_IDS', () => {
  test('matches the flattened framework indicator count', () => {
    const expected = ESG_FRAMEWORK.reduce((acc, e) => acc + e.indicators.length, 0);
    expect(ALL_INDICATOR_IDS).toHaveLength(expected);
  });
});

describe('findIncompleteElements', () => {
  test('a blank form reports every one of the 14 elements as incomplete', () => {
    const incomplete = findIncompleteElements(emptyFormState());
    expect(incomplete).toHaveLength(ESG_FRAMEWORK.length);
  });

  test('an element with all its indicators filled is not reported', () => {
    const form = emptyFormState();
    for (const indicator of ESG_FRAMEWORK[0].indicators) {
      form[indicator.id] = '1';
    }
    const incomplete = findIncompleteElements(form);
    expect(incomplete.some((e) => e.elementId === ESG_FRAMEWORK[0].id)).toBe(false);
  });

  test('an element with only some indicators filled is still reported once', () => {
    const form = emptyFormState();
    form[ESG_FRAMEWORK[0].indicators[0].id] = '1';
    const incomplete = findIncompleteElements(form);
    expect(incomplete.filter((e) => e.elementId === ESG_FRAMEWORK[0].id)).toHaveLength(1);
  });

  test('a fully filled form reports no incomplete elements', () => {
    const form = emptyFormState();
    for (const id of ALL_INDICATOR_IDS) {
      form[id] = '1';
    }
    expect(findIncompleteElements(form)).toHaveLength(0);
  });
});
