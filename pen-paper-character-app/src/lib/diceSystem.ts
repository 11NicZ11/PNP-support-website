'use client';

import { rollDice, type DiceType, rollAbilityCheck, type RollResult } from './dice';

// Re-exporte für andere Dateien
export type { DiceType };

// ==================== GLOBALER LOGGING-CALLBACK ====================
let globalLogCallback: ((log: Omit<RollResult, 'id' | 'timestamp'>) => void) | null = null;

export function setGlobalLogCallback(callback: (log: Omit<RollResult, 'id' | 'timestamp'>) => void) {
  globalLogCallback = callback;
}

// Zentrale Logging-Funktion
function addToLog(log: Omit<RollResult, 'id' | 'timestamp'>) {
  if (globalLogCallback) {
    globalLogCallback(log);
  }
}

// ==================== WÜRFEL-FUNKTIONEN MIT AUTOMATISCHEM LOGGING ====================

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

// Einfachen Würfel werfen (automatisch geloggt)
export function roll(
  diceType: DiceType,
  options: RollOptions = {}
): { roll: number; total: number } {
  const sides = { d4: 4, d6: 6, d8: 8, d10: 10, d12: 12, d20: 20, d100: 100 }[diceType];
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

// Initiative würfeln (speziell für Initiative mit Logging)
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

// Attributsprobe (automatisch geloggt mit Vor-/Nachteil)
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
    const advantageText = options.advantage === 'advantage' ? ' (mit Vorteil)' : 
                          options.advantage === 'disadvantage' ? ' (mit Nachteil)' : '';
    
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

// Rettungswurf (automatisch geloggt mit Vor-/Nachteil)
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
    setTimeout(() => {
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
        const advantageText = options.advantage === 'advantage' ? ' (mit Vorteil)' : 
                              options.advantage === 'disadvantage' ? ' (mit Nachteil)' : '';
        
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
    }, 200);
  });
}