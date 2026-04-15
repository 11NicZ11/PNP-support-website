'use client';

import { useDiceLog } from '@/contexts/DiceLogContext';
import { 
  roll as baseRoll, 
  abilityCheck as baseAbilityCheck,
  savingThrow as baseSavingThrow,
  rollInitiative as baseRollInitiative,
} from '@/lib/diceSystem';
import type { DiceType, RollOptions } from '@/lib/diceSystem';

export function useDice(character?: { id: string; name: string }) {
  const { addLog } = useDiceLog();

  // Einfacher Würfelwurf (loggt automatisch)
  const roll = (diceType: DiceType, options: Omit<RollOptions, 'characterId' | 'characterName'> = {}) => {
    return baseRoll(diceType, {
      ...options,
      characterId: character?.id,
      characterName: character?.name,
    });
  };

  // Initiative würfeln (loggt automatisch)
  const rollInitiative = (modifier: number) => {
    return baseRollInitiative(modifier, {
      characterId: character?.id,
      characterName: character?.name,
    });
  };

  // Attributsprobe (loggt automatisch)
  const abilityCheck = (
    abilityName: string,
    modifier: number,
    options: { advantage?: 'normal' | 'advantage' | 'disadvantage' } = {}
  ) => {
    return baseAbilityCheck(abilityName, modifier, {
      ...options,
      characterId: character?.id,
      characterName: character?.name,
    });
  };

  // Rettungswurf (loggt automatisch, ohne Erfolgsanzeige)
  const savingThrow = (
    abilityName: string,
    modifier: number,
    options: { advantage?: 'normal' | 'advantage' | 'disadvantage' } = {}
  ) => {
    return baseSavingThrow(abilityName, modifier, {
      ...options,
      characterId: character?.id,
      characterName: character?.name,
    });
  };

  return {
    roll,
    rollInitiative,
    abilityCheck,
    savingThrow,
  };
}