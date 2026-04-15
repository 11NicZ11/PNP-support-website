'use client';

import { DiceButton } from './DiceButton';
import { DiceType } from '@/lib/dice';

interface DiceSetProps {
  characterName?: string;
  characterId?: string;
  className?: string;
}

const diceTypes: DiceType[] = ['d4', 'd6', 'd8', 'd10', 'd12', 'd20', 'd100'];

export function DiceSet({ characterName, characterId, className = '' }: DiceSetProps) {
  return (
    <div className={`grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2 ${className}`}>
      {diceTypes.map(dice => (
        <DiceButton
          key={dice}
          diceType={dice}
          characterName={characterName}
          characterId={characterId}
          reason={`${dice.toUpperCase()} geworfen`}
          className="w-full justify-center"
        >
          {dice.toUpperCase()}
        </DiceButton>
      ))}
    </div>
  );
}