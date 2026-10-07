// src/components/character/tabs/SpellsTab.tsx
'use client';

import { Spell, SpellSlot } from '@/types/spells';
import { UnitSystem } from '@/types/character';
import { Attribute } from '@/components/character/editors/AttributesEditor';
import { ClassLevel } from '@/components/character/editors/ClassLevelsEditor';
import { SpellsView } from '@/components/spells/SpellsView';
import { SpellsEditTab } from '@/components/spells/SpellsEditTab';

interface SpellsTabProps {
  characterId: string;
  mode: 'create' | 'edit' | 'view';
  readOnly?: boolean;
  unitSystem: UnitSystem;
  spells: Spell[];
  onSpellsUpdate: (spells: Spell[]) => void;
  spellSlots: SpellSlot[];
  onSpellSlotsUpdate: (slots: SpellSlot[]) => void;
  onAddSpell: () => void;
  onEditSpell: (spell: Spell) => void;
  onCastConcentration?: (spell: Spell) => void;
  characterName?: string;
  // 🔥 NEU
  classLevels?: ClassLevel[];
  attributes?: Attribute[];
  proficiencyBonus?: number;
}

export function SpellsTab({
  characterId,
  mode,
  readOnly = false,
  unitSystem,
  spells,
  onSpellsUpdate,
  spellSlots,
  onSpellSlotsUpdate,
  onAddSpell,
  onEditSpell,
  onCastConcentration,
  characterName,
  classLevels = [],
  attributes = [],
  proficiencyBonus = 2,
}: SpellsTabProps) {
  const isView = readOnly || mode === 'view';

  if (isView) {
    return (
      <SpellsView
        spells={spells}
        spellSlots={spellSlots}
        unitSystem={unitSystem}
        characterName={characterName}
        classLevels={classLevels}
        attributes={attributes}
        proficiencyBonus={proficiencyBonus}
        onCastConcentration={onCastConcentration}
      />
    );
  }

  return (
    <SpellsEditTab
      characterId={characterId}
      spells={spells}
      onSpellsUpdate={onSpellsUpdate}
      spellSlots={spellSlots}
      onSpellSlotsUpdate={onSpellSlotsUpdate}
      unitSystem={unitSystem}
      onAddSpell={onAddSpell}
      onEditSpell={onEditSpell}
      onCastConcentration={onCastConcentration}
      characterName={characterName}
      classLevels={classLevels}
      attributes={attributes}
      proficiencyBonus={proficiencyBonus}
    />
  );
}