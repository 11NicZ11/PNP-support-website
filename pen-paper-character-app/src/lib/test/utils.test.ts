// src/lib/test/utils.test.ts
import { describe, it, expect } from 'vitest';
import {
  parseJsonArray,
  parseJsonObject,
  stringifyJsonArray,
  stringifyJsonObject,
  getModifier,
  getModifierText,
  getAttributeValue,
  getCombinedBonuses,
  getStorageKey,
  saveToStorage,
  loadFromStorage,
  isImmune,
  isResistant,
  calculateDamage,
} from '../utils';

describe('JSON helpers', () => {
  it('parseJsonArray accepts arrays, strings, garbage', () => {
    expect(parseJsonArray(['a'])).toEqual(['a']);
    expect(parseJsonArray('["a","b"]')).toEqual(['a', 'b']);
    expect(parseJsonArray('not json')).toEqual([]);
    expect(parseJsonArray(null)).toEqual([]);
  });

  it('parseJsonObject same behavior', () => {
    expect(parseJsonObject({ a: 1 })).toEqual({ a: 1 });
    expect(parseJsonObject('{"a":1}')).toEqual({ a: 1 });
    expect(parseJsonObject('garbage')).toEqual({});
  });

  it('stringify helpers pass strings through unchanged', () => {
    expect(stringifyJsonArray('["x"]')).toBe('["x"]');
    expect(stringifyJsonObject('{"x":1}')).toBe('{"x":1}');
  });

  it('stringify helpers serialize objects', () => {
    expect(stringifyJsonArray([1, 2])).toBe('[1,2]');
    expect(stringifyJsonObject({ a: 1 })).toBe('{"a":1}');
  });
});

describe('modifier helpers', () => {
  it('getModifier matches D&D 5e formula', () => {
    expect(getModifier(1)).toBe(-5);
    expect(getModifier(10)).toBe(0);
    expect(getModifier(11)).toBe(0);
    expect(getModifier(12)).toBe(1);
    expect(getModifier(20)).toBe(5);
  });

  it('getModifierText formats with sign', () => {
    expect(getModifierText(10)).toBe('+0');
    expect(getModifierText(14)).toBe('+2');
    expect(getModifierText(8)).toBe('-1');
  });

  it('getAttributeValue falls back to 10 when missing', () => {
    const attrs = [{ name: 'Stärke', value: 15 }];
    expect(getAttributeValue(attrs, 'Stärke')).toBe(15);
    expect(getAttributeValue(attrs, 'Geschick')).toBe(10);
  });
});

describe('getCombinedBonuses', () => {
  it('sums bonuses by key', () => {
    const out = getCombinedBonuses(
      { Stärke: 2, Konstitution: 1 },
      { Stärke: 1, Weisheit: 2 }
    );
    expect(out).toEqual({ Stärke: 3, Konstitution: 1, Weisheit: 2 });
  });

  it('handles empty inputs', () => {
    expect(getCombinedBonuses()).toEqual({});
    expect(getCombinedBonuses(undefined, undefined)).toEqual({});
  });
});

describe('storage helpers', () => {
  it('getStorageKey composes prefix and id', () => {
    expect(getStorageKey('abc123', 'containers')).toBe('containers_abc123');
  });

  it('saveToStorage + loadFromStorage round-trip', () => {
    const key = getStorageKey('abc123', 'containers');
    saveToStorage(key, [{ id: 1 }]);
    expect(loadFromStorage(key, [])).toEqual([{ id: 1 }]);
  });

  it('loadFromStorage returns fallback on missing key', () => {
    expect(loadFromStorage('nonexistent', { fallback: true })).toEqual({
      fallback: true,
    });
  });

  it('loadFromStorage returns fallback on corrupt data', () => {
    localStorage.setItem('bad', 'not json');
    expect(loadFromStorage('bad', [])).toEqual([]);
  });
});

describe('defense helpers', () => {
  it('isImmune is case-insensitive', () => {
    expect(isImmune(['Feuer'], 'feuer')).toBe(true);
    expect(isImmune(['Feuer'], 'Kälte')).toBe(false);
  });

  it('isResistant is case-insensitive', () => {
    expect(isResistant(['Kälte'], 'kälte')).toBe(true);
    expect(isResistant(['Kälte'], 'Feuer')).toBe(false);
  });

  it('calculateDamage: immunity → 0', () => {
    expect(calculateDamage(100, 'Feuer', ['Feuer'], [])).toBe(0);
  });

  it('calculateDamage: resistance → half (floored)', () => {
    expect(calculateDamage(15, 'Kälte', [], ['Kälte'])).toBe(7);
  });

  it('calculateDamage: neither → unchanged', () => {
    expect(calculateDamage(20, 'Gift', [], [])).toBe(20);
  });

  it('immunity takes precedence over resistance', () => {
    expect(calculateDamage(100, 'Feuer', ['Feuer'], ['Feuer'])).toBe(0);
  });
});