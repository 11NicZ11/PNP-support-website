// src/lib/defaults/defaults.test.ts
import { describe, it, expect } from 'vitest';
import { DND_SKILLS } from '@/lib/defaults/skills';
import {
  DND_LANGUAGES,
  DND_ARMORS,
  DND_WEAPONS,
  DND_TOOLS,
} from '@/lib/defaults/proficiencies';
import {
  DND_DAMAGE_TYPES,
  DND_CONDITIONS,
  DND_STATUS_EFFECTS,
} from '@/lib/defaults/defenses';
import { DND_ACTIONS } from '@/lib/defaults/actions';
import { DND_WEAPON_PROPERTIES } from '@/lib/defaults/weaponProperties';

/**
 * Invariant tests, not snapshots. They catch "someone accidentally deleted
 * an entry" or "two entries with the same name" without forcing a review
 * for cosmetic changes.
 */

function expectUniqueNames(items: { name: string }[]) {
  const names = items.map((i) => i.name);
  expect(new Set(names).size).toBe(names.length);
}

describe('DND_SKILLS', () => {
  it('has unique names', () => expectUniqueNames(DND_SKILLS));

  it('uses only valid attributes', () => {
    const valid = new Set([
      'strength',
      'dexterity',
      'constitution',
      'intelligence',
      'wisdom',
      'charisma',
    ]);
    for (const s of DND_SKILLS) {
      expect(valid.has(s.attribute), `invalid attribute: ${s.attribute}`).toBe(true);
    }
  });

  it('covers every attribute that has skills in 5e (no Constitution skills exist)', () => {
    const attrs = new Set(DND_SKILLS.map((s) => s.attribute));
    expect(attrs).toEqual(
      new Set([
        'strength',
        'dexterity',
        'intelligence',
        'wisdom',
        'charisma',
      ])
    );
  });

  it('every skill has a description', () => {
    for (const s of DND_SKILLS) {
      expect(s.description.length, `${s.name} has empty description`).toBeGreaterThan(0);
    }
  });
});

describe('DND_LANGUAGES / ARMORS / WEAPONS / TOOLS', () => {
  it('each group has unique names', () => {
    expectUniqueNames(DND_LANGUAGES);
    expectUniqueNames(DND_ARMORS);
    expectUniqueNames(DND_WEAPONS);
    expectUniqueNames(DND_TOOLS);
  });

  it('each entry has icon and description', () => {
    for (const list of [DND_LANGUAGES, DND_ARMORS, DND_WEAPONS, DND_TOOLS]) {
      for (const item of list) {
        expect(item.icon.length, `${item.name} missing icon`).toBeGreaterThan(0);
        expect(item.description.length, `${item.name} missing description`).toBeGreaterThan(0);
      }
    }
  });
});

describe('DND_DAMAGE_TYPES', () => {
  it('has an entry for every canonical damage type', () => {
    const expected = [
      'Wucht',
      'Stich',
      'Hieb',
      'Feuer',
      'Kälte',
      'Blitz',
      'Donner',
      'Säure',
      'Gift',
      'Psychisch',
      'Nekrotisch',
      'Strahlend',
      'Kraft',
    ];
    const names = DND_DAMAGE_TYPES.map((d) => d.name);
    expect(names.sort()).toEqual(expected.sort());
  });
});

describe('DND_CONDITIONS', () => {
  it('has unique names', () => expectUniqueNames(DND_CONDITIONS));
});

describe('DND_STATUS_EFFECTS', () => {
  it('has unique names', () => expectUniqueNames(DND_STATUS_EFFECTS));

  it('each has an icon', () => {
    for (const e of DND_STATUS_EFFECTS) {
      expect(e.icon.length, `${e.name} missing icon`).toBeGreaterThan(0);
    }
  });
});

describe('DND_ACTIONS', () => {
  it('has unique names', () => expectUniqueNames(DND_ACTIONS));

  it('only uses valid action types', () => {
    const valid = new Set(['action', 'bonus_action', 'reaction']);
    for (const a of DND_ACTIONS) {
      expect(valid.has(a.type), `${a.name} has invalid type ${a.type}`).toBe(true);
    }
  });
});

describe('DND_WEAPON_PROPERTIES', () => {
  it('has unique names', () => expectUniqueNames(DND_WEAPON_PROPERTIES));

  it('every property has a description', () => {
    for (const p of DND_WEAPON_PROPERTIES) {
      expect(p.description.length, `${p.name} missing description`).toBeGreaterThan(0);
    }
  });
});