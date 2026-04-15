'use client';

import { useState } from 'react';
import { useDice } from '@/hooks/useDice';
import { AdvantageToggle, AdvantageState } from './AdvantageToggle';

interface AbilityCheckWithAdvantageProps {
  abilityName: string;
  modifier: number;
  characterId?: string;
  characterName?: string;
  onRoll?: (result: number) => void;
  className?: string;
  showAdvantageToggle?: boolean;
}

export function AbilityCheckWithAdvantage({ 
  abilityName, 
  modifier, 
  characterId,
  characterName,
  onRoll,
  className = '',
  showAdvantageToggle = true
}: AbilityCheckWithAdvantageProps) {
  const [rolling, setRolling] = useState(false);
  const [advantage, setAdvantage] = useState<AdvantageState>('normal');
  const { abilityCheck } = useDice(characterId && characterName ? { id: characterId, name: characterName } : undefined);

  const handleRoll = async () => {
    setRolling(true);
    const result = abilityCheck(abilityName, modifier, { advantage });
    if (onRoll) {
      onRoll(result.total);
    }
    setRolling(false);
  };

  const modifierText = modifier >= 0 ? `+${modifier}` : `${modifier}`;
  const advantageText = advantage === 'advantage' ? '(Vorteil)' : advantage === 'disadvantage' ? '(Nachteil)' : '';

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {showAdvantageToggle && (
        <AdvantageToggle 
          onAdvantageChange={setAdvantage}
          size="small"
        />
      )}
      <button
        onClick={handleRoll}
        disabled={rolling}
        className={`flex-1 py-1.5 px-3 rounded-lg font-bold text-sm transition ${
          modifier >= 0 
            ? 'bg-green-600/50 hover:bg-green-600 text-green-100' 
            : 'bg-red-600/50 hover:bg-red-600 text-red-100'
        } ${rolling ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        {rolling ? (
          <span className="animate-spin inline-block">🎲</span>
        ) : (
          <span>{modifierText} {advantageText}</span>
        )}
      </button>
    </div>
  );
}