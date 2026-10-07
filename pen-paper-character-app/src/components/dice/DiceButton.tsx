// src/components/dice/DiceButton.tsx
'use client';

import { useState } from 'react';
import { useDice } from '@/hooks/useDice';
import { diceInfo, DiceType } from '@/lib/dice';
import { RollResult } from '@/lib/dice';
import { AdvantageToggle, AdvantageState } from './AdvantageToggle';

interface DiceButtonProps {
  diceType: DiceType;
  modifier?: number;
  reason?: string;
  characterId?: string;
  characterName?: string;
  onRoll?: (result: number) => void;
  className?: string;
  children?: React.ReactNode;
  sourceType?: RollResult['sourceType'];
  sourceId?: string;
  sourceName?: string;
  showAdvantageToggle?: boolean;
  /** Falls angegeben, wird die abilityCheck-Funktion für Vorteil/Nachteil genutzt */
  abilityName?: string;
}

export function DiceButton({
  diceType,
  modifier = 0,
  reason,
  characterId,
  characterName,
  onRoll,
  className = '',
  children,
  sourceType = 'manual',
  sourceId,
  sourceName,
  showAdvantageToggle = false,
  abilityName, // neu: für Attributsproben mit Vorteil
}: DiceButtonProps) {
  const [rolling, setRolling] = useState(false);
  const [advantage, setAdvantage] = useState<AdvantageState>('normal');
  const { roll: rollDice, abilityCheck } = useDice(
    characterId && characterName ? { id: characterId, name: characterName } : undefined
  );
  const dice = diceInfo[diceType];

  const handleRoll = async () => {
    setRolling(true);
    await new Promise((resolve) => setTimeout(resolve, 300));

    let result: { total: number };

    if (abilityName && showAdvantageToggle) {
      // Attributsprobe mit Vorteil/Nachteil
      result = abilityCheck(abilityName, modifier, { advantage });
    } else {
      // Normaler Würfelwurf (ohne Vorteil)
      result = rollDice(diceType, {
        modifier,
        reason: reason || `${dice.name} würfeln`,
        sourceType,
        sourceId,
        sourceName,
      });
    }

    if (onRoll) {
      onRoll(result.total);
    }

    setRolling(false);
  };

  const advantageLabel =
    advantage === 'advantage' ? '(Vorteil)' :
    advantage === 'disadvantage' ? '(Nachteil)' : '';

  return (
    <div className="inline-flex items-center gap-2">
      {showAdvantageToggle && (
        <AdvantageToggle
          onAdvantageChange={setAdvantage}
          initialValue={advantage}
          size="small"
        />
      )}
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
        {showAdvantageToggle && advantageLabel && (
          <span className="text-xs text-gray-300 ml-1">{advantageLabel}</span>
        )}
      </button>
    </div>
  );
}