// src/lib/enums/enums.test.ts
import { describe, it, expect } from 'vitest';
import { DAMAGE_TYPES } from '@/lib/enums/damageTypes';
import {
  EQUIPMENT_TYPES,
  ARMOR_TYPES,
  ACTION_TYPES,
  SPELL_SCHOOLS,
  SPELL_COMPONENTS,
} from '@/lib/enums/equipmentTypes';

describe('DAMAGE_TYPES', () => {
  it('has exactly 13 canonical types', () => {
    expect(DAMAGE_TYPES).toHaveLength(13);
  });

  it('has no duplicates', () => {
    expect(new Set(DAMAGE_TYPES).size).toBe(DAMAGE_TYPES.length);
  });
});

describe('EQUIPMENT_TYPES', () => {
  it('every entry has label, icon, and category', () => {
    for (const [key, def] of Object.entries(EQUIPMENT_TYPES)) {
      expect(def.label, `${key}.label`).toBeTruthy();
      expect(def.icon, `${key}.icon`).toBeTruthy();
      expect(def.category, `${key}.category`).toBeTruthy();
    }
  });

  it('contains the canonical weapon/armor/shield/clothing keys', () => {
    for (const key of ['weapon', 'armor', 'shield', 'clothing', 'other']) {
      expect(EQUIPMENT_TYPES[key], `missing equipment type: ${key}`).toBeDefined();
    }
  });
});

describe('ARMOR_TYPES', () => {
  it('is the canonical three', () => {
    expect(ARMOR_TYPES).toEqual(['light', 'medium', 'heavy']);
  });
});

describe('ACTION_TYPES', () => {
  it('contains the six D&D action categories', () => {
    expect(ACTION_TYPES).toEqual(
      expect.arrayContaining([
        'action',
        'bonus_action',
        'reaction',
        'legendary_action',
        'lair_action',
        'free_action',
      ])
    );
  });
});

describe('SPELL_SCHOOLS (string variant)', () => {
  it('has 8 canonical schools', () => {
    expect(SPELL_SCHOOLS).toHaveLength(8);
  });

  it('has no duplicates', () => {
    expect(new Set(SPELL_SCHOOLS).size).toBe(SPELL_SCHOOLS.length);
  });
});

describe('SPELL_COMPONENTS', () => {
  it('is V, S, M', () => {
    expect(SPELL_COMPONENTS).toEqual(['V', 'S', 'M']);
  });
});