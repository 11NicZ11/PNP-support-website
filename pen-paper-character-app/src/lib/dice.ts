// Würfel-Typen
export type DiceType = 'd4' | 'd6' | 'd8' | 'd10' | 'd12' | 'd20' | 'd100';

export interface RollResult {
  id: string;
  dice: DiceType;
  result: number | number[];  // Kann jetzt auch ein Array von Würfen sein
  modifier?: number;
  total?: number;
  reason: string;
  sourceType: 'ability' | 'savingThrow' | 'weapon' | 'spell' | 'feature' | 'manual';
  sourceId?: string;
  sourceName?: string;
  characterId?: string;
  characterName?: string;
  timestamp: Date;
  isCrit?: boolean;
  advantageType?: 'normal' | 'advantage' | 'disadvantage';  // Art des Wurfs
  allRolls?: number[];  // Alle Würfe bei Vor-/Nachteil
}

// Basis-Würfel-Funktion (ohne Logging)
export const rollDice = (sides: number): number => {
  return Math.floor(Math.random() * sides) + 1;
};

// Für Attributsproben (ohne Logging, wird von diceSystem genutzt)
export const rollAbilityCheck = (modifier: number, advantage?: 'normal' | 'advantage' | 'disadvantage'): { rolls: number[]; total: number; usedRoll: number } => {
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

// Würfel-Mapping für UI
export const diceInfo: Record<DiceType, { sides: number; icon: string; name: string }> = {
  d4: { sides: 4, icon: '🎲', name: 'W4' },
  d6: { sides: 6, icon: '🎲', name: 'W6' },
  d8: { sides: 8, icon: '🎲', name: 'W8' },
  d10: { sides: 10, icon: '🎲', name: 'W10' },
  d12: { sides: 12, icon: '🎲', name: 'W12' },
  d20: { sides: 20, icon: '🎯', name: 'W20' },
  d100: { sides: 100, icon: '💯', name: 'W100' },
};