'use client';

import { useState } from 'react';
import { useDice } from '@/hooks/useDice';
import { diceInfo, DiceType } from '@/lib/dice';

interface DiceButtonProps {
  diceType: DiceType;
  modifier?: number;
  reason?: string;
  characterId?: string;
  characterName?: string;
  onRoll?: (result: number) => void;
  className?: string;
  children?: React.ReactNode;
}

export function DiceButton({ 
  diceType, 
  modifier = 0, 
  reason, 
  characterId,
  characterName,
  onRoll, 
  className = '',
  children 
}: DiceButtonProps) {
  const [rolling, setRolling] = useState(false);
  const { roll } = useDice(characterId && characterName ? { id: characterId, name: characterName } : undefined);
  const dice = diceInfo[diceType];

  const handleRoll = async () => {
    setRolling(true);
    
    // Würfelanimation (kurze Verzögerung)
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const result = roll(diceType, { 
      modifier, 
      reason: reason || `${dice.name} würfeln`,
      sourceType: 'manual'
    });
    
    if (onRoll) {
      onRoll(result.total);
    }
    
    setRolling(false);
  };

  return (
    <button
      onClick={handleRoll}
      disabled={rolling}
      className={`inline-flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-500 hover:to-purple-600 rounded-lg transition disabled:opacity-50 ${className}`}
    >
      {rolling ? (
        <span className="animate-spin">🎲</span>
      ) : (
        <span>{dice.icon}</span>
      )}
      {children || `${dice.name}${modifier !== 0 ? ` ${modifier >= 0 ? `+${modifier}` : `${modifier}`}` : ''}`}
    </button>
  );
}