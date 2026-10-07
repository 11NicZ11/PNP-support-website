// pen-paper-character-app\src\components\character\view\ActiveEffectsList.tsx

'use client';

import { StatusEffect } from '@/types/statusEffects';
import { useState } from 'react';

interface ActiveEffectsListProps {
  effects: StatusEffect[];
  onManageClick: () => void;
}

export function ActiveEffectsList({ effects, onManageClick }: ActiveEffectsListProps) {
  const [hoveredEffect, setHoveredEffect] = useState<string | null>(null);

  if (effects.length === 0) {
    return (
      <button type="button"
        onClick={onManageClick}
        className="px-3 py-1 bg-indigo-600/50 rounded-lg text-sm flex items-center gap-2"
      >
        ✨ Keine aktiven Effekte
      </button>
    );
  }

  return (
    <div className="flex flex-wrap gap-2 items-center">
      {effects.slice(0, 5).map(effect => (
        <div
          key={effect.id}
          className="relative"
          onMouseEnter={() => setHoveredEffect(effect.id)}
          onMouseLeave={() => setHoveredEffect(null)}
        >
          <div className="bg-yellow-600/30 border border-yellow-500 rounded-lg px-2 py-1 flex items-center gap-1 text-sm">
            <span>{effect.icon}</span>
            <span>{effect.name}</span>
          </div>
          {hoveredEffect === effect.id && (
            <div className="absolute z-10 top-full left-0 mt-1 bg-gray-800 border border-purple-500 rounded-lg p-2 text-xs whitespace-nowrap">
              {effect.description}
              {effect.duration && (
                <div className="text-gray-400">Dauer: {effect.duration} {effect.durationUnit}</div>
              )}
            </div>
          )}
        </div>
      ))}
      {effects.length > 5 && (
        <div className="bg-gray-700 rounded-lg px-2 py-1 text-xs">
          +{effects.length - 5} weitere
        </div>
      )}
      <button type="button" onClick={onManageClick} className="ml-2 px-2 py-1 bg-indigo-600 rounded-lg text-xs">
        Verwalten
      </button>
    </div>
  );
}