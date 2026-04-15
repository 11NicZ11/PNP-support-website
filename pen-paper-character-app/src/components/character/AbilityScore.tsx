'use client';

import { useState } from 'react';
import { useDice } from '@/hooks/useDice';
import { AdvantageToggle, AdvantageState } from '@/components/dice/AdvantageToggle';

interface AbilityScoreProps {
  name: string;
  score: number;
  characterName?: string;
  characterId?: string;
}

export function AbilityScore({ name, score, characterName, characterId }: AbilityScoreProps) {
  const [rolling, setRolling] = useState(false);
  const [advantage, setAdvantage] = useState<AdvantageState>('normal');
  
  const getModifier = (score: number): number => {
    return Math.floor((score - 10) / 2);
  };

  const modifier = getModifier(score);
  const modifierText = modifier >= 0 ? `+${modifier}` : `${modifier}`;
  
  const { abilityCheck } = useDice(characterId && characterName ? { id: characterId, name: characterName } : undefined);

  const handleRoll = async () => {
    setRolling(true);
    await abilityCheck(name, modifier, { advantage });
    setRolling(false);
  };

  return (
    <div className="bg-gray-800/50 rounded-lg p-3 text-center">
      <div className="text-sm text-gray-400">{name}</div>
      <div className="text-2xl font-bold">{score}</div>
      <div className="text-xs text-gray-500 mb-2">Mod: {modifierText}</div>
      <div className="flex items-center gap-2">
        <AdvantageToggle 
          onAdvantageChange={setAdvantage}
          size="small"
        />
        <button
          onClick={handleRoll}
          disabled={rolling}
          className="flex-1 px-3 py-2 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-500 hover:to-purple-600 rounded-lg transition text-sm disabled:opacity-50"
        >
          {rolling ? '🎲' : '🎯 Würfeln'}
        </button>
      </div>
    </div>
  );
}