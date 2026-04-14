'use client';

import { useState } from 'react';

interface InitiativeButtonProps {
  dexterity: number;
  initiativeBonus: number;
}

export function InitiativeButton({ dexterity, initiativeBonus }: InitiativeButtonProps) {
  const [rolling, setRolling] = useState(false);
  const [lastRoll, setLastRoll] = useState<number | null>(null);

  const getModifier = (score: number): number => {
    return Math.floor((score - 10) / 2);
  };

  const totalBonus = getModifier(dexterity) + initiativeBonus;

  const rollInitiative = async () => {
    setRolling(true);
    const roll = Math.floor(Math.random() * 20) + 1;
    const total = roll + totalBonus;
    
    await new Promise(resolve => setTimeout(resolve, 500));
    
    setLastRoll(total);
    setRolling(false);
  };

  return (
    <div className="bg-gray-800/50 rounded-lg p-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm text-gray-400 mb-1">🎯 Initiative</h3>
          <div className="text-3xl font-bold text-purple-400">
            +{totalBonus}
          </div>
          <div className="text-xs text-gray-500">
            Geschick {getModifier(dexterity) >= 0 ? `+${getModifier(dexterity)}` : getModifier(dexterity)} 
            {initiativeBonus !== 0 && ` + ${initiativeBonus} Bonus`}
          </div>
        </div>
        
        <div className="text-center">
          <button
            onClick={rollInitiative}
            disabled={rolling}
            className="px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg font-semibold hover:opacity-90 transition disabled:opacity-50 flex items-center gap-2 text-lg"
          >
            {rolling ? '🎲' : '🎯'} Würfeln
          </button>
          {lastRoll !== null && (
            <div className="mt-2 text-sm text-gray-400">
              Letzter Wurf: <span className="text-xl font-bold text-orange-400">{lastRoll}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}