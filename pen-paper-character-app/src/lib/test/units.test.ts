// src/lib/test/units.test.ts
import { describe, it, expect } from 'vitest';
import {
  KG_TO_LB,
  LB_TO_KG,
  FT_TO_M,
  M_TO_FT,
  kgToLb,
  lbToKg,
  mToFt,
  ftToM,
  formatWeight,
  formatDistance,
  formatDistanceString,
  parseWeightInput,
  parseDistanceInput,
  displayWeightValue,
  displayDistanceValue,
  getWeightUnitLabel,
  getDistanceUnitLabel,
} from '../units';

describe('constants and inverses', () => {
  it('lbToKg is the inverse of kgToLb', () => {
    expect(kgToLb(1)).toBeCloseTo(KG_TO_LB, 6);
    expect(lbToKg(kgToLb(1))).toBeCloseTo(1, 6);
    expect(LB_TO_KG).toBeCloseTo(1 / KG_TO_LB, 6);
  });

  it('ftToM is the inverse of mToFt', () => {
    expect(ftToM(mToFt(1))).toBeCloseTo(1, 6);
    expect(M_TO_FT).toBeCloseTo(1 / FT_TO_M, 6);
  });
});

describe('formatWeight', () => {
  it('formats metric as kg', () => {
    expect(formatWeight(70, 'metric')).toBe('70 kg');
  });

  it('formats imperial as lb', () => {
    expect(formatWeight(70, 'imperial')).toBe('154 lb'); // 70 * 2.2 = 154
  });

  it('returns empty string for null/undefined', () => {
    expect(formatWeight(null, 'metric')).toBe('');
    expect(formatWeight(undefined, 'metric')).toBe('');
  });
});

describe('formatDistance', () => {
  it('formats metric as m', () => {
    expect(formatDistance(30, 'metric')).toBe('30 m');
  });

  it('formats imperial as ft', () => {
    expect(formatDistance(30, 'imperial')).toBe('100 ft'); // 30 / 0.3 = 100
  });
});

describe('formatDistanceString', () => {
  it('handles range pattern "30/120" as ft → metric', () => {
    expect(formatDistanceString('30/120', 'metric')).toBe('9/36 m');
  });

  it('handles range pattern "30/120" as ft → imperial', () => {
    expect(formatDistanceString('30/120', 'imperial')).toBe('30/120 ft');
  });

  it('handles explicit ft → metric', () => {
    expect(formatDistanceString('30 ft', 'metric')).toBe('9 m');
  });

  it('handles explicit m → imperial', () => {
    expect(formatDistanceString('9 m', 'imperial')).toBe('30 ft');
  });

  it('returns input unchanged when no unit can be inferred', () => {
    expect(formatDistanceString('egal', 'metric')).toBe('egal');
  });

  it('returns empty for null/empty', () => {
    expect(formatDistanceString('', 'metric')).toBe('');
    expect(formatDistanceString(null, 'metric')).toBe('');
  });
});

describe('parseWeightInput / parseDistanceInput', () => {
  it('parseWeightInput converts imperial lb → kg', () => {
    expect(parseWeightInput('154', 'imperial')).toBeCloseTo(70, 0);
  });

  it('parseWeightInput passes through metric', () => {
    expect(parseWeightInput('70', 'metric')).toBe(70);
  });

  it('parseWeightInput returns null for empty', () => {
    expect(parseWeightInput('', 'metric')).toBeNull();
    expect(parseWeightInput(null, 'metric')).toBeNull();
  });

  it('parseDistanceInput converts imperial ft → m', () => {
    expect(parseDistanceInput('30', 'imperial')).toBeCloseTo(9, 6);
  });
});

describe('display values', () => {
  it('metric kg stored → imperial displays lb', () => {
    expect(displayWeightValue(70, 'imperial')).toBe('154');
  });

  it('metric m stored → imperial displays ft', () => {
    expect(displayDistanceValue(30, 'imperial')).toBe('100');
  });
});

describe('unit labels', () => {
  it('weight label reflects system', () => {
    expect(getWeightUnitLabel('metric')).toBe('kg');
    expect(getWeightUnitLabel('imperial')).toBe('lb');
  });

  it('distance label reflects system', () => {
    expect(getDistanceUnitLabel('metric')).toBe('m');
    expect(getDistanceUnitLabel('imperial')).toBe('ft');
  });
});

// ---- Additional branch coverage ----

describe('units - null + imperial combos', () => {
  it('formatWeight(null, imperial) returns empty', () => {
    expect(formatWeight(null, 'imperial')).toBe('');
  });

  it('formatDistance(null, imperial) returns empty', () => {
    expect(formatDistance(null, 'imperial')).toBe('');
  });

  it('displayWeightValue(null) returns empty', () => {
    expect(displayWeightValue(null, 'metric')).toBe('');
  });

  it('displayDistanceValue(null) returns empty', () => {
    expect(displayDistanceValue(null, 'metric')).toBe('');
  });
});

describe('units - formatDistanceString branch coverage', () => {
  it('m-suffix + metric passes through unchanged', () => {
    expect(formatDistanceString('9 m', 'metric')).toBe('9 m');
  });

  it('ft-suffix + imperial passes through unchanged', () => {
    expect(formatDistanceString('30 ft', 'imperial')).toBe('30 ft');
  });

  it('range pattern scales with the metric conversion for both parts', () => {
    expect(formatDistanceString('15/60', 'metric')).toBe('4.5/18 m');
  });
});

describe('units - parse inputs branch coverage', () => {
  it('parseWeightInput returns null for undefined', () => {
    expect(parseWeightInput(undefined, 'metric')).toBeNull();
  });

  it('parseWeightInput returns null for NaN-producing input', () => {
    expect(parseWeightInput('abc', 'metric')).toBeNull();
  });

  it('parseDistanceInput returns null for empty string', () => {
    expect(parseDistanceInput('', 'metric')).toBeNull();
  });

  it('parseDistanceInput returns null for NaN-producing input', () => {
    expect(parseDistanceInput('abc', 'metric')).toBeNull();
  });
});