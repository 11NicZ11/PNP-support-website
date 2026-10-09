// src/lib/test/dice.test.ts
import { describe, it, expect, vi } from 'vitest';
import {
  rollDice,
  rollAbilityCheck,
  rollHitDie,
  roll,
  rollWeaponDamage,
  rollInitiative,
  abilityCheck,
  savingThrow,
  rollHitDieForHealing,
  diceInfo,
  setGlobalLogCallback,
  type DiceType,
  type RollResult,
} from '../dice';

/**
 * Forces Math.random to return a deterministic sequence.
 * Rolls are 1-indexed: value v in [k/sides, (k+1)/sides) → roll k+1.
 */
function mockRandomSequence(seq: number[]) {
  let i = 0;
  vi.spyOn(Math, 'random').mockImplementation(() => {
    const v = seq[i++ % seq.length];
    if (v < 0 || v >= 1) {
      throw new Error('mockRandomSequence values must be in [0, 1)');
    }
    return v;
  });
}

describe('rollDice', () => {
  it('returns 1 when Math.random returns 0', () => {
    mockRandomSequence([0]);
    expect(rollDice(20)).toBe(1);
  });

  it('returns sides when Math.random is just below 1', () => {
    mockRandomSequence([0.999999]);
    expect(rollDice(20)).toBe(20);
  });

  it('never exceeds bounds over 100 rolls', () => {
    for (let i = 0; i < 100; i++) {
      const v = rollDice(6);
      expect(v).toBeGreaterThanOrEqual(1);
      expect(v).toBeLessThanOrEqual(6);
    }
  });
});

describe('rollAbilityCheck', () => {
  it('normal mode rolls once', () => {
    mockRandomSequence([0.5]); // d20 → 11
    const r = rollAbilityCheck(3);
    expect(r.rolls).toEqual([11]);
    expect(r.usedRoll).toBe(11);
    expect(r.total).toBe(14);
  });

  it('advantage rolls twice and picks the higher', () => {
    mockRandomSequence([0.05, 0.5]); // rolls 2, 11
    const r = rollAbilityCheck(0, 'advantage');
    expect(r.rolls).toEqual([2, 11]);
    expect(r.usedRoll).toBe(11);
    expect(r.total).toBe(11);
  });

  it('disadvantage rolls twice and picks the lower', () => {
    mockRandomSequence([0.05, 0.5]); // rolls 2, 11
    const r = rollAbilityCheck(0, 'disadvantage');
    expect(r.usedRoll).toBe(2);
    expect(r.total).toBe(2);
  });
});

describe('rollHitDie', () => {
  it('applies CON modifier', () => {
    mockRandomSequence([0.5]); // d8 → 5
    const r = rollHitDie('d8', 3);
    expect(r.roll).toBe(5);
    expect(r.total).toBe(8);
  });

  it('clamps total to 1 minimum', () => {
    mockRandomSequence([0]); // d8 → 1
    const r = rollHitDie('d8', -10);
    expect(r.total).toBe(1);
  });
});

describe('diceInfo', () => {
  it('defines every DiceType', () => {
    const types: DiceType[] = ['d4', 'd6', 'd8', 'd10', 'd12', 'd20', 'd100'];
    for (const t of types) {
      expect(diceInfo[t]).toBeDefined();
      expect(diceInfo[t].sides).toBe(Number(t.slice(1)));
    }
  });
});

describe('rollWeaponDamage', () => {
  it('sums multiple damage entries and reports per-type details', () => {
    // d6 #1 → 3, d6 #2 → 4 (sum 7 + modifier 2 = 9 Feuer), d8 → 5 Hieb
    mockRandomSequence([0.4, 0.5, 0.5]);
    const out = rollWeaponDamage(
      [
        { diceType: 'd6', count: 2, damageType: 'Feuer', modifier: 2 },
        { diceType: 'd8', count: 1, damageType: 'Hieb' },
      ],
      { silent: true }
    );
    expect(out.total).toBe(14);
    expect(out.damageDetails).toHaveLength(2);
    expect(out.damageDetails[0]).toMatchObject({ type: 'Feuer', total: 9 });
    expect(out.damageDetails[1]).toMatchObject({ type: 'Hieb', total: 5 });
  });

  it('does not invoke log callback when silent', () => {
    const spy = vi.fn();
    setGlobalLogCallback(spy);
    mockRandomSequence([0.5]);
    rollWeaponDamage([{ diceType: 'd6', count: 1 }], { silent: true });
    expect(spy).not.toHaveBeenCalled();
  });

  it('invokes log callback when not silent', () => {
    const spy = vi.fn();
    setGlobalLogCallback(spy);
    mockRandomSequence([0.5]);
    rollWeaponDamage([{ diceType: 'd6', count: 1 }], { reason: 'Test' });
    expect(spy).toHaveBeenCalledOnce();
    const log = spy.mock.calls[0][0] as Omit<RollResult, 'id' | 'timestamp'>;
    expect(log.reason).toBe('Test');
    expect(log.dice).toBe('weapon');
  });
});

describe('roll / abilityCheck / savingThrow / rollInitiative', () => {
  it('roll() adds modifier and defaults sourceType to manual', () => {
    mockRandomSequence([0.5]);
    const spy = vi.fn();
    setGlobalLogCallback(spy);
    const r = roll('d20', { modifier: 3, reason: 'Test' });
    expect(r.roll).toBe(11);
    expect(r.total).toBe(14);
    expect(spy.mock.calls[0][0].sourceType).toBe('manual');
  });

  it('abilityCheck() marks advantage in reason', () => {
    mockRandomSequence([0.05, 0.5]);
    const spy = vi.fn();
    setGlobalLogCallback(spy);
    abilityCheck('Stärke', 2, { advantage: 'advantage' });
    expect(spy.mock.calls[0][0].reason).toContain('mit Vorteil');
  });

  it('savingThrow() resolves with correct total', async () => {
    mockRandomSequence([0.5]); // 11
    const r = await savingThrow('Weisheit', 4);
    expect(r.total).toBe(15);
  });

  it('rollInitiative() logs reason "Initiative"', () => {
    mockRandomSequence([0.5]);
    const spy = vi.fn();
    setGlobalLogCallback(spy);
    rollInitiative(2);
    expect(spy.mock.calls[0][0].reason).toBe('Initiative');
  });
});

describe('rollHitDieForHealing', () => {
  it('enforces minimum healing equal to count', () => {
    mockRandomSequence([0]); // every roll = 1
    const out = rollHitDieForHealing('d8', {
      conModifier: -5,
      count: 3,
      silent: true,
    });
    // rawSum = 3, CON penalty = -15 → clamped to count (3)
    expect(out.totalHealing).toBe(3);
  });

  it('sums rolls and CON modifier correctly', () => {
    mockRandomSequence([0.5, 0.5, 0.5]); // d8 → 5, 5, 5
    const out = rollHitDieForHealing('d8', {
      conModifier: 2,
      count: 3,
      silent: true,
    });
    expect(out.rolls).toEqual([5, 5, 5]);
    expect(out.totalHealing).toBe(21); // 15 + 2*3
  });
});


// ---- Additional branch coverage: roll() ----

describe('roll - branch coverage', () => {
  it('handles modifier: 0 explicitly (undefined check passed)', () => {
    mockRandomSequence([0.5]); // d20 → 11
    const spy = vi.fn();
    setGlobalLogCallback(spy);
    const r = roll('d20', { modifier: 0, reason: 'Test' });
    expect(r.total).toBe(11);
    // log.total = (modifier !== undefined) ? total : undefined → 11
    expect(spy.mock.calls[0][0].total).toBe(11);
  });

  it('omits total from log when modifier is undefined', () => {
    mockRandomSequence([0.5]);
    const spy = vi.fn();
    setGlobalLogCallback(spy);
    const r = roll('d20');
    expect(r.total).toBe(11);
    // modifier undefined → log.total is undefined
    expect(spy.mock.calls[0][0].total).toBeUndefined();
  });

  it('isCrit is false for non-d20 dice', () => {
    mockRandomSequence([0.999]); // d6 → 6
    const spy = vi.fn();
    setGlobalLogCallback(spy);
    roll('d6', { modifier: 0 });
    // 6 === (diceType === 'd20' ? 20 : undefined) → 6 === undefined → false
    expect(spy.mock.calls[0][0].isCrit).toBe(false);
  });

  it('isCrit is true for d20 rolling 20', () => {
    mockRandomSequence([0.999]); // d20 → 20
    const spy = vi.fn();
    setGlobalLogCallback(spy);
    roll('d20', { modifier: 0 });
    expect(spy.mock.calls[0][0].isCrit).toBe(true);
  });
});

// ---- Additional branch coverage: rollWeaponDamage ----

describe('rollWeaponDamage - branch coverage', () => {
  it('uses "Schaden" as default type when damageType omitted', () => {
    mockRandomSequence([0.5]); // d6 → 4
    const out = rollWeaponDamage([{ diceType: 'd6', count: 1 }], {
      silent: true,
    });
    expect(out.damageDetails[0].type).toBe('Schaden');
  });

  it('handles count > 1 (loops rolls correctly)', () => {
    mockRandomSequence([0.1, 0.5, 0.9]); // d6 → 1, 4, 6 → sum 11
    const out = rollWeaponDamage([{ diceType: 'd6', count: 3 }], {
      silent: true,
    });
    expect(out.results[0]).toBe(11);
  });

  it('applies modifier 0 without side effects', () => {
    mockRandomSequence([0.5]); // d6 → 4
    const out = rollWeaponDamage(
      [{ diceType: 'd6', count: 1, modifier: 0 }],
      { silent: true }
    );
    expect(out.total).toBe(4);
  });
});

// ---- Additional branch coverage: abilityCheck ----

describe('abilityCheck - branch coverage', () => {
  it('logs disadvantage in reason', () => {
    mockRandomSequence([0.05, 0.9]);
    const spy = vi.fn();
    setGlobalLogCallback(spy);
    abilityCheck('Weisheit', 0, { advantage: 'disadvantage' });
    expect(spy.mock.calls[0][0].reason).toContain('mit Nachteil');
  });

  it('silent mode does not log', () => {
    mockRandomSequence([0.5]);
    const spy = vi.fn();
    setGlobalLogCallback(spy);
    abilityCheck('Stärke', 2, { silent: true });
    expect(spy).not.toHaveBeenCalled();
  });
});

// ---- Additional branch coverage: savingThrow ----

describe('savingThrow - branch coverage', () => {
  it('advantage picks the higher roll', async () => {
    mockRandomSequence([0.05, 0.5]); // rolls 2, 11
    const r = await savingThrow('Geschick', 0, { advantage: 'advantage' });
    expect(r.usedRoll).toBe(11);
  });

  it('disadvantage picks the lower roll', async () => {
    mockRandomSequence([0.05, 0.5]);
    const r = await savingThrow('Geschick', 0, { advantage: 'disadvantage' });
    expect(r.usedRoll).toBe(2);
  });

  it('normal mode logs sourceType savingThrow', async () => {
    mockRandomSequence([0.5]);
    const spy = vi.fn();
    setGlobalLogCallback(spy);
    await savingThrow('Konstitution', 2);
    expect(spy.mock.calls[0][0].sourceType).toBe('savingThrow');
  });

  it('silent mode does not log', async () => {
    mockRandomSequence([0.5]);
    const spy = vi.fn();
    setGlobalLogCallback(spy);
    await savingThrow('Konstitution', 2, { silent: true });
    expect(spy).not.toHaveBeenCalled();
  });
});