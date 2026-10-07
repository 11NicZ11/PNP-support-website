// pen-paper-character-app\src\components\character\view\InitiativeButton.tsx

'use client';

import { useState } from 'react';
import { rollInitiative } from '@/lib/dice';

interface InitiativeButtonProps {
  initiativeBonus: number;
  characterId?: string;
  characterName?: string;
  sources?: { id: string; type: string; name: string; value: number; dependsOn?: string }[];
  attributes?: { id: string; name: string; value: number }[];
}

export function InitiativeButton({
  initiativeBonus,
  characterId,
  characterName,
  sources = [],
  attributes = [],
}: InitiativeButtonProps) {
  const [rolling, setRolling] = useState(false);
  const [lastRoll, setLastRoll] = useState<number | null>(null);

  const bonusText = initiativeBonus >= 0 ? `+${initiativeBonus}` : `${initiativeBonus}`;

  const handleRoll = async () => {
    setRolling(true);
    await new Promise(resolve => setTimeout(resolve, 200));

    const { total } = rollInitiative(initiativeBonus, {
      characterId: characterId,
      characterName: characterName,
    });

    setLastRoll(total);
    setRolling(false);
  };

  const getSourceValue = (source: any) => {
    if (source.dependsOn) {
      const attr = attributes.find(a => a.name === source.dependsOn);
      return attr ? Math.floor((attr.value - 10) / 2) : 0;
    }
    return source.value;
  };

  return (
    <div className="bg-gray-800/50 rounded-lg p-3 min-w-[200px]">
      <div className="flex items-center justify-between">
        <div className="relative group">
          <span className="text-sm text-gray-400 cursor-help">🎯 Initiative</span>
          {sources.length > 0 && (
            <div className="absolute z-10 left-0 top-full mt-1 bg-gray-800 border border-purple-500 rounded-lg p-2 text-sm whitespace-nowrap opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all pointer-events-none min-w-[120px]">
              <div className="font-semibold text-purple-300 text-xs mb-1">Quellen:</div>
              {sources.map(s => {
                const val = getSourceValue(s);
                return (
                  <div key={s.id} className="flex justify-between text-xs text-gray-300">
                    <span>{s.name}</span>
                    <span className={val >= 0 ? 'text-green-400' : 'text-red-400'}>
                      {val >= 0 ? `+${val}` : `${val}`}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

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
            className="px-5 py-2.5 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg font-bold hover:opacity-90 transition disabled:opacity-50 min-w-[80px] text-center text-base"
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