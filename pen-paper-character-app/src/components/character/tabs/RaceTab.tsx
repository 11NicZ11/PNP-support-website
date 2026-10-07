// src/components/character/tabs/RaceTab.tsx
'use client';

import { RaceEditor, RaceData } from '@/components/character/editors/RaceEditor';
import { RaceView } from '@/components/character/views/RaceView';
import { Attribute } from '@/components/character/editors/AttributesEditor';
import { Skill } from '@/types/skills';
import { UnitSystem } from '@/types/character';
import { DefenseItem } from '@/components/character/modals/DefensesModal';

interface RaceTabProps {
  characterId: string;
  mode: 'create' | 'edit' | 'view';
  raceData: RaceData;
  onRaceDataUpdate: (data: RaceData) => void;
  attributes: Attribute[];
  skills: Skill[];
  readOnly?: boolean;
  unitSystem: UnitSystem;
  alignment: string;
  onAlignmentChange: (alignment: string) => void;
  // Verteidigungen
  defenses: DefenseItem[];
  onDefensesChange: (defenses: DefenseItem[]) => void;
}

export function RaceTab({
  characterId,
  mode,
  raceData,
  onRaceDataUpdate,
  attributes,
  skills,
  readOnly = false,
  unitSystem,
  alignment,
  onAlignmentChange,
  defenses,
  onDefensesChange,
}: RaceTabProps) {
  const isView = readOnly || mode === 'view';

  if (isView) {
    return (
      <RaceView
        raceData={raceData}
        unitSystem={unitSystem}
        alignment={alignment}
      />
    );
  }

  return (
    <RaceEditor
      raceData={raceData}
      onChange={onRaceDataUpdate}
      availableAttributes={attributes.map((a) => a.name)}
      availableSkills={skills.map((s) => s.name)}
      unitSystem={unitSystem}
      alignment={alignment}
      onAlignmentChange={onAlignmentChange}
      defenses={defenses}
      onDefensesChange={onDefensesChange}
      characterId={characterId}
    />
  );
}