// src/components/character/shared/RestButtons.tsx
'use client';

import { useState } from 'react';
import { ShortRestModal } from './ShortRestModal';
import { LongRestModal } from './LongRestModal';
import { CharacterResource, CharacterHitDice } from '@/types/resources';
import { SpellSlot } from '@/types/spells';

interface RestButtonsProps {
  characterId: string;
  characterName?: string;
  currentHp: number;
  maxHp: number;
  tempHp: number;
  tempMaxHp: number;
  tempMaxHpMax: number;
  exhaustionLevel: number;
  constitutionValue: number;
  resources: CharacterResource[];
  hitDice: CharacterHitDice[];
  spellSlots: SpellSlot[];
  lastLongRest?: string | null;
  onUpdated: (data: any) => void;
  disabled?: boolean;
}

export function RestButtons({
  characterId,
  characterName,
  currentHp,
  maxHp,
  tempHp,
  tempMaxHp,
  tempMaxHpMax,
  exhaustionLevel,
  constitutionValue,
  resources,
  hitDice,
  spellSlots,
  lastLongRest,
  onUpdated,
  disabled = false,
}: RestButtonsProps) {
  const [shortRestOpen, setShortRestOpen] = useState(false);
  const [longRestOpen, setLongRestOpen] = useState(false);

  return (
    <>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setShortRestOpen(true)}
          disabled={disabled}
          className="px-3 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition text-sm font-medium disabled:opacity-50 flex items-center gap-1"
          title="Kurze Rast (1 Stunde)"
        >
          ☕ Kurze Rast
        </button>
        <button
          type="button"
          onClick={() => setLongRestOpen(true)}
          disabled={disabled}
          className="px-3 py-2 bg-green-600 hover:bg-green-700 rounded-lg transition text-sm font-medium disabled:opacity-50 flex items-center gap-1"
          title="Lange Rast (8 Stunden)"
        >
          🛌 Lange Rast
        </button>
      </div>

      <ShortRestModal
        isOpen={shortRestOpen}
        onClose={() => setShortRestOpen(false)}
        characterId={characterId}
        characterName={characterName}
        currentHp={currentHp}
        maxHp={maxHp}
        constitutionValue={constitutionValue}
        resources={resources}
        hitDice={hitDice}
        onUpdated={onUpdated}
      />

      <LongRestModal
        isOpen={longRestOpen}
        onClose={() => setLongRestOpen(false)}
        characterId={characterId}
        characterName={characterName}
        currentHp={currentHp}
        maxHp={maxHp}
        tempHp={tempHp}
        tempMaxHp={tempMaxHp}
        tempMaxHpMax={tempMaxHpMax}
        exhaustionLevel={exhaustionLevel}
        resources={resources}
        hitDice={hitDice}
        spellSlots={spellSlots}
        lastLongRest={lastLongRest}
        onUpdated={onUpdated}
      />
    </>
  );
}