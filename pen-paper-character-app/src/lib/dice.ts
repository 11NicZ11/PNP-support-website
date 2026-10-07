// src/lib/dice.ts
'use client';

// ==================== TYPES ====================
export type DiceType = 'd4' | 'd6' | 'd8' | 'd10' | 'd12' | 'd20' | 'd100';

export interface DamageDetail {
  type: string;
  total: number;
  diceType?: string;
  count?: number;
  rolls?: number[];
}

export interface RollResult {
  id: string;
  dice: DiceType | 'weapon' | 'hitdie';
  result: number | number[];
  modifier?: number;
  total?: number;
  reason: string;
  sourceType:
    | 'ability'
    | 'savingThrow'
    | 'weapon'
    | 'spell'
    | 'feature'
    | 'manual'
    | 'hitdie';
  sourceId?: string;
  sourceName?: string;
  characterId?: string;
  characterName?: string;
  timestamp: Date;
  isCrit?: boolean;
  advantageType?: 'normal' | 'advantage' | 'disadvantage';
  allRolls?: number[];
  damageDetails?: DamageDetail[];
}

// ==================== CORE ROLLS ====================
export const rollDice = (sides: number): number => {
  return Math.floor(Math.random() * sides) + 1;
};

export const rollAbilityCheck = (
  modifier: number,
  advantage?: 'normal' | 'advantage' | 'disadvantage'
): { rolls: number[]; total: number; usedRoll: number } => {
  if (advantage === 'advantage') {
    const roll1 = rollDice(20);
    const roll2 = rollDice(20);
    const best = Math.max(roll1, roll2);
    return { rolls: [roll1, roll2], total: best + modifier, usedRoll: best };
  } else if (advantage === 'disadvantage') {
    const roll1 = rollDice(20);
    const roll2 = rollDice(20);
    const worst = Math.min(roll1, roll2);
    return { rolls: [roll1, roll2], total: worst + modifier, usedRoll: worst };
  } else {
    const roll = rollDice(20);
    return { rolls: [roll], total: roll + modifier, usedRoll: roll };
  }
};

export const rollHitDie = (
  dieType: DiceType,
  conModifier: number = 0
): { roll: number; total: number; conModifier: number } => {
  const sides = {
    d4: 4,
    d6: 6,
    d8: 8,
    d10: 10,
    d12: 12,
    d20: 20,
    d100: 100,
  }[dieType];
  const roll = rollDice(sides);
  return { roll, total: Math.max(1, roll + conModifier), conModifier };
};

export const diceInfo: Record<
  DiceType,
  { sides: number; icon: string; name: string }
> = {
  d4: { sides: 4, icon: '🎲', name: 'W4' },
  d6: { sides: 6, icon: '🎲', name: 'W6' },
  d8: { sides: 8, icon: '🎲', name: 'W8' },
  d10: { sides: 10, icon: '🎲', name: 'W10' },
  d12: { sides: 12, icon: '🎲', name: 'W12' },
  d20: { sides: 20, icon: '🎯', name: 'W20' },
  d100: { sides: 100, icon: '💯', name: 'W100' },
};

// ==================== GLOBAL LOG CALLBACK ====================
let globalLogCallback:
  | ((log: Omit<RollResult, 'id' | 'timestamp'>) => void)
  | null = null;

export function setGlobalLogCallback(
  callback: (log: Omit<RollResult, 'id' | 'timestamp'>) => void
) {
  globalLogCallback = callback;
}

function addToLog(log: Omit<RollResult, 'id' | 'timestamp'>) {
  if (globalLogCallback) {
    globalLogCallback(log);
  }
}

// ==================== ROLLING WITH LOGGING ====================
export interface RollOptions {
  modifier?: number;
  reason?: string;
  sourceType?: RollResult['sourceType'];
  sourceId?: string;
  sourceName?: string;
  characterId?: string;
  characterName?: string;
  silent?: boolean;
}

export interface WeaponDamageRoll {
  diceType: DiceType;
  count: number;
  damageType?: string;
  modifier?: number;
}

export interface WeaponDamageOptions {
  reason?: string;
  sourceId?: string;
  sourceName?: string;
  characterId?: string;
  characterName?: string;
  silent?: boolean;
  sourceType?: RollResult['sourceType'];
}

export function rollWeaponDamage(
  damages: WeaponDamageRoll[],
  options: WeaponDamageOptions = {}
): {
  results: number[];
  total: number;
  details: string;
  damageDetails: DamageDetail[];
} {
  const results: number[] = [];
  let total = 0;
  const detailParts: string[] = [];
  const damageDetails: DamageDetail[] = [];

  damages.forEach((dmg) => {
    let sum = 0;
    const rollResults: number[] = [];

    for (let i = 0; i < dmg.count; i++) {
      const roll = rollDice(parseInt(dmg.diceType.replace('d', '')));
      rollResults.push(roll);
      sum += roll;
    }

    const finalSum = sum + (dmg.modifier || 0);
    results.push(finalSum);
    total += finalSum;

    const typeLabel = dmg.damageType || 'Schaden';
    const detail = `${dmg.count}${dmg.diceType} ${typeLabel} = ${finalSum}`;
    detailParts.push(detail);
    damageDetails.push({
      type: typeLabel,
      total: finalSum,
      diceType: dmg.diceType,
      count: dmg.count,
      rolls: rollResults,
    });
  });

  const details = detailParts.join(', ');

  if (!options.silent && globalLogCallback) {
    addToLog({
      dice: 'weapon' as any,
      result: results,
      modifier: undefined,
      total: total,
      reason: options.reason || 'Waffenangriff',
      sourceType: options.sourceType || 'weapon',
      sourceId: options.sourceId,
      sourceName: options.sourceName,
      characterId: options.characterId,
      characterName: options.characterName,
      isCrit: false,
      advantageType: 'normal',
      allRolls: results,
      damageDetails: damageDetails,
    });
  }

  return { results, total, details, damageDetails };
}

export function roll(
  diceType: DiceType,
  options: RollOptions = {}
): { roll: number; total: number } {
  const sides = {
    d4: 4,
    d6: 6,
    d8: 8,
    d10: 10,
    d12: 12,
    d20: 20,
    d100: 100,
  }[diceType];
  const rollResult = rollDice(sides);
  const total = rollResult + (options.modifier || 0);

  if (!options.silent && globalLogCallback) {
    addToLog({
      dice: diceType,
      result: rollResult,
      modifier: options.modifier,
      total: options.modifier !== undefined ? total : undefined,
      reason: options.reason || `${diceType.toUpperCase()} geworfen`,
      sourceType: options.sourceType || 'manual',
      sourceId: options.sourceId,
      sourceName: options.sourceName,
      characterId: options.characterId,
      characterName: options.characterName,
      isCrit: rollResult === (diceType === 'd20' ? 20 : undefined),
      advantageType: 'normal',
    });
  }

  return { roll: rollResult, total };
}

export function rollHitDieForHealing(
  dieType: DiceType,
  options: {
    conModifier?: number;
    count?: number;
    reason?: string;
    sourceId?: string;
    sourceName?: string;
    characterId?: string;
    characterName?: string;
    silent?: boolean;
  } = {}
): {
  rolls: number[];
  totalHealing: number;
  conModifier: number;
  count: number;
} {
  const count = options.count ?? 1;
  const conModifier = options.conModifier ?? 0;

  const rolls: number[] = [];
  let rawSum = 0;
  for (let i = 0; i < count; i++) {
    const { roll: r } = rollHitDie(dieType, 0);
    rolls.push(r);
    rawSum += r;
  }

  const totalHealing = Math.max(count, rawSum + conModifier * count);

  if (!options.silent && globalLogCallback) {
    const conText =
      conModifier !== 0
        ? ` ${conModifier >= 0 ? '+' : ''}${conModifier} pro Würfel`
        : '';
    addToLog({
      dice: 'hitdie' as any,
      result: rolls,
      modifier: conModifier,
      total: totalHealing,
      reason:
        options.reason ||
        `Trefferwürfel (${count}× ${dieType.toUpperCase()}${conText})`,
      sourceType: 'hitdie',
      sourceId: options.sourceId,
      sourceName: options.sourceName,
      characterId: options.characterId,
      characterName: options.characterName,
      isCrit: false,
      advantageType: 'normal',
      allRolls: rolls,
    });
  }

  return { rolls, totalHealing, conModifier, count };
}

export function rollInitiative(
  modifier: number,
  options: {
    characterId?: string;
    characterName?: string;
    silent?: boolean;
  } = {}
): { roll: number; total: number } {
  const rollResult = rollDice(20);
  const total = rollResult + modifier;

  if (!options.silent && globalLogCallback) {
    addToLog({
      dice: 'd20',
      result: rollResult,
      modifier: modifier,
      total: total,
      reason: `Initiative`,
      sourceType: 'ability',
      characterId: options.characterId,
      characterName: options.characterName,
      isCrit: rollResult === 20,
      advantageType: 'normal',
    });
  }

  return { roll: rollResult, total };
}

export function abilityCheck(
  abilityName: string,
  modifier: number,
  options: {
    advantage?: 'normal' | 'advantage' | 'disadvantage';
    characterId?: string;
    characterName?: string;
    silent?: boolean;
  } = {}
): { rolls: number[]; total: number; usedRoll: number } {
  const result = rollAbilityCheck(modifier, options.advantage || 'normal');

  if (!options.silent && globalLogCallback) {
    const advantageText =
      options.advantage === 'advantage'
        ? ' (mit Vorteil)'
        : options.advantage === 'disadvantage'
        ? ' (mit Nachteil)'
        : '';

    addToLog({
      dice: 'd20',
      result: result.usedRoll,
      modifier: modifier,
      total: result.total,
      reason: `${abilityName} Probe${advantageText}`,
      sourceType: 'ability',
      characterId: options.characterId,
      characterName: options.characterName,
      isCrit: result.usedRoll === 20,
      advantageType: options.advantage || 'normal',
      allRolls: result.rolls,
    });
  }

  return result;
}

export function savingThrow(
  abilityName: string,
  modifier: number,
  options: {
    advantage?: 'normal' | 'advantage' | 'disadvantage';
    characterId?: string;
    characterName?: string;
    silent?: boolean;
  } = {}
): Promise<{ rolls: number[]; total: number; usedRoll: number }> {
  return new Promise((resolve) => {
    let rolls: number[];
    let usedRoll: number;

    if (options.advantage === 'advantage') {
      const roll1 = rollDice(20);
      const roll2 = rollDice(20);
      rolls = [roll1, roll2];
      usedRoll = Math.max(roll1, roll2);
    } else if (options.advantage === 'disadvantage') {
      const roll1 = rollDice(20);
      const roll2 = rollDice(20);
      rolls = [roll1, roll2];
      usedRoll = Math.min(roll1, roll2);
    } else {
      const roll = rollDice(20);
      rolls = [roll];
      usedRoll = roll;
    }

    const total = usedRoll + modifier;

    if (!options.silent && globalLogCallback) {
      const advantageText =
        options.advantage === 'advantage'
          ? ' (mit Vorteil)'
          : options.advantage === 'disadvantage'
          ? ' (mit Nachteil)'
          : '';

      addToLog({
        dice: 'd20',
        result: usedRoll,
        modifier: modifier,
        total: total,
        reason: `${abilityName} Rettungswurf${advantageText}`,
        sourceType: 'savingThrow',
        characterId: options.characterId,
        characterName: options.characterName,
        isCrit: usedRoll === 20,
        advantageType: options.advantage || 'normal',
        allRolls: rolls,
      });
    }

    resolve({ rolls, total, usedRoll });
  });
}