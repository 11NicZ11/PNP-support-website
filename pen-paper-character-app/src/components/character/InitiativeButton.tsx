'use client';

import { useState } from 'react';
import { rollInitiative } from '@/lib/diceSystem';

interface InitiativeButtonProps {
  dexterity: number;
  initiativeBonus: number;
  characterId?: string;
  characterName?: string;
}

export function InitiativeButton({ 
  dexterity, 
  initiativeBonus, 
  characterId,
  characterName 
}: InitiativeButtonProps) {
  const [rolling, setRolling] = useState(false);
  const [lastRoll, setLastRoll] = useState<number | null>(null);

  const getModifier = (score: number): number => {
    return Math.floor((score - 10) / 2);
  };

  const totalBonus = getModifier(dexterity) + initiativeBonus;
  const bonusText = totalBonus >= 0 ? `+${totalBonus}` : `${totalBonus}`;

  const handleRoll = async () => {
    setRolling(true);
    
    // Kurze Verzögerung für Animation
    await new Promise(resolve => setTimeout(resolve, 200));
    
    // Verwende die spezielle Initiative-Funktion für korrektes Logging
    const { total } = rollInitiative(totalBonus, {
      characterId: characterId,
      characterName: characterName,
    });
    
    setLastRoll(total);
    setRolling(false);
  };

  return (
    <div className="bg-gray-800/50 rounded-lg p-3">
      <div className="flex items-center justify-between">
        {/* Linke Seite: Initiative Text */}
        <span className="text-sm text-gray-400">🎯 Initiative</span>
        
        {/* Rechte Seite: Letzter Wurf und Bonus als Button */}
        <div className="flex items-center gap-3">
          {lastRoll !== null && (
            <div className="text-right">
              <div className="text-xs text-gray-500">Letzter Wurf</div>
              <div className="text-2xl font-bold text-orange-400">{lastRoll}</div>
            </div>
          )}
          
          <button
            onClick={handleRoll}
            disabled={rolling}
            className="px-4 py-2 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg font-bold hover:opacity-90 transition disabled:opacity-50 min-w-[70px] text-center"
          >
            {rolling ? (
              <span className="animate-spin inline-block">🎲</span>
            ) : (
              <span>{bonusText}</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}