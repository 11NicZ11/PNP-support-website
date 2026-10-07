// src/components/character/forms/CharacterHeader.tsx
'use client';

import Link from 'next/link';
import { RestButtons } from '../modals/RestButtons';
import { ExhaustionTracker } from '../modals/ExhaustionTracker';
import { ActiveFormBanner } from '../ActiveFormBanner';
import { AlternateForm } from '@/types/forms';
import { CharacterResource, CharacterHitDice } from '@/types/resources';
import { SpellSlot } from '@/types/spells';
import { UnitSystem } from '@/types/character';

interface CharacterHeaderProps {
  characterId: string;
  name: string;
  isNew: boolean;
  isView: boolean;
  activeForm: AlternateForm | null;
  unitSystem: UnitSystem;
  currentHp: number;
  totalHp: number;
  tempHp: number;
  tempMaxHp: number;
  tempMaxHpMax: number;
  exhaustionLevel: number;
  constitutionValue: number;
  resources: CharacterResource[];
  hitDice: CharacterHitDice[];
  spellSlots: SpellSlot[];
  lastLongRest: string | null;
  onRestUpdated: (updated: any) => void;
  onExhaustionChange: (level: number) => void;
  onDeactivateForm: (form: AlternateForm) => void;
  onFormDamage: (amount: number) => void;
  onFormHeal: (amount: number) => void;
}

export function CharacterHeader({
  characterId,
  name,
  isNew,
  isView,
  activeForm,
  unitSystem,
  currentHp,
  totalHp,
  tempHp,
  tempMaxHp,
  tempMaxHpMax,
  exhaustionLevel,
  constitutionValue,
  resources,
  hitDice,
  spellSlots,
  lastLongRest,
  onRestUpdated,
  onExhaustionChange,
  onDeactivateForm,
  onFormDamage,
  onFormHeal,
}: CharacterHeaderProps) {
  return (
    <>
      <div className="flex justify-between items-start gap-4 mb-6 flex-wrap">
        <div>
          <Link href="/characters" className="text-purple-400">
            ← Zurück
          </Link>
          <h1 className="text-2xl font-bold inline ml-4">
            {isNew
              ? 'Neuen Charakter erstellen'
              : isView
              ? 'Charakter anzeigen'
              : 'Charakter bearbeiten'}
          </h1>
        </div>

        {!isNew && (
          <RestButtons
            characterId={characterId}
            characterName={name}
            currentHp={currentHp || totalHp}
            maxHp={totalHp}
            tempHp={tempHp}
            tempMaxHp={tempMaxHp}
            tempMaxHpMax={tempMaxHpMax}
            exhaustionLevel={exhaustionLevel}
            constitutionValue={constitutionValue}
            resources={resources}
            hitDice={hitDice}
            spellSlots={spellSlots}
            lastLongRest={lastLongRest}
            onUpdated={onRestUpdated}
          />
        )}
      </div>

      {!isNew && activeForm && (
        <div className="mb-4">
          <ActiveFormBanner
            form={activeForm}
            unitSystem={unitSystem}
            characterId={characterId}
            characterName={name}
            onDeactivate={() => onDeactivateForm(activeForm)}
            onDamage={onFormDamage}
            onHeal={onFormHeal}
            readOnly={isView}
          />
        </div>
      )}

      {!isNew && (
        <div className="mb-6">
          <ExhaustionTracker
            level={exhaustionLevel}
            onChange={onExhaustionChange}
            readOnly={isView}
          />
        </div>
      )}
    </>
  );
}