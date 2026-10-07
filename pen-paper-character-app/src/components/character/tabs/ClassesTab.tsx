// src/components/character/tabs/ClassesTab.tsx
'use client';

import {
  ClassLevelsEditor,
  ClassLevel,
} from '@/components/character/editors/ClassLevelsEditor';
import { ClassLevelsView } from '@/components/character/views/ClassLevelsView';
import {
  ClassProgression,
  ExpMode,
  HitDiceMode,
  HpSource,
  LevelingMode,
} from '@/types/character';
import { Attribute } from '@/components/character/editors/AttributesEditor';
import { CharacterResource, CharacterHitDice } from '@/types/resources';
import { AlternateForm } from '@/types/forms';
import { Companion } from '@/types/companions';
import { DefenseItem } from '@/components/character/modals/DefensesModal';

interface ClassesTabProps {
  characterId: string;
  mode: 'create' | 'edit' | 'view';
  classLevels: ClassLevel[];
  onClassLevelsUpdate: (levels: ClassLevel[]) => void;
  characterLevel: number;
  onCharacterLevelChange: (level: number) => void;
  levelingMode: LevelingMode;
  experience: number;
  onExperienceChange: (exp: number) => void;
  nextLevelExp: number;
  onNextLevelExpChange: (exp: number) => void;
  expMode: ExpMode;
  onExpModeChange: (mode: ExpMode) => void;
  expThresholds: Record<number, number>;
  onExpThresholdsChange: (t: Record<number, number>) => void;
  classProgression: ClassProgression;
  onClassProgressionChange: (prog: ClassProgression) => void;
  hpSources: HpSource[];
  onHpSourcesUpdate: (sources: HpSource[]) => void;
  attributes: Attribute[];
  resources: CharacterResource[];
  onResourcesUpdate: (resources: CharacterResource[]) => void;
  hitDice: CharacterHitDice[];
  onHitDiceUpdate: (hitDice: CharacterHitDice[]) => void;
  hasHitDice: boolean;
  onHasHitDiceChange: (v: boolean) => void;
  hitDiceMode: HitDiceMode;
  onHitDiceModeChange: (m: HitDiceMode) => void;
  characterName?: string;
  onHeal?: (amount: number) => void;
  readOnly?: boolean;
  alternateForms?: AlternateForm[];
  companions?: Companion[];
  // Verteidigungen
  classDefenses: Record<string, DefenseItem[]>;
  onClassDefensesChange: (
    className: string,
    defenses: DefenseItem[]
  ) => void;
}

export function ClassesTab({
  characterId,
  mode,
  classLevels,
  onClassLevelsUpdate,
  characterLevel,
  onCharacterLevelChange,
  levelingMode,
  experience,
  onExperienceChange,
  nextLevelExp,
  onNextLevelExpChange,
  expMode,
  onExpModeChange,
  expThresholds,
  onExpThresholdsChange,
  classProgression,
  onClassProgressionChange,
  hpSources,
  onHpSourcesUpdate,
  attributes,
  resources,
  onResourcesUpdate,
  hitDice,
  onHitDiceUpdate,
  hasHitDice,
  onHasHitDiceChange,
  hitDiceMode,
  onHitDiceModeChange,
  characterName,
  onHeal,
  readOnly = false,
  alternateForms = [],
  companions = [],
  classDefenses,
  onClassDefensesChange,
}: ClassesTabProps) {
  const isView = readOnly || mode === 'view';
  const constitutionValue =
    attributes.find((a) => a.name === 'Konstitution')?.value ?? 10;
  const attributeNames = attributes.map((a) => a.name);

  if (isView) {
    return (
      <ClassLevelsView
        classLevels={classLevels}
        characterLevel={characterLevel}
        levelingMode={levelingMode}
        experience={experience}
        nextLevelExp={nextLevelExp}
        classProgression={classProgression}
        hpSources={hpSources}
        constitutionValue={constitutionValue}
        resources={resources}
        hitDice={hitDice}
        hasHitDice={hasHitDice}
      />
    );
  }

  return (
    <ClassLevelsEditor
      classLevels={classLevels}
      onUpdate={onClassLevelsUpdate}
      characterLevel={characterLevel}
      onCharacterLevelChange={onCharacterLevelChange}
      levelingMode={levelingMode}
      experience={experience}
      onExperienceChange={onExperienceChange}
      nextLevelExp={nextLevelExp}
      onNextLevelExpChange={onNextLevelExpChange}
      expMode={expMode}
      onExpModeChange={onExpModeChange}
      expThresholds={expThresholds}
      onExpThresholdsChange={onExpThresholdsChange}
      classProgression={classProgression}
      onClassProgressionChange={onClassProgressionChange}
      hpSources={hpSources}
      onHpSourcesUpdate={onHpSourcesUpdate}
      constitutionValue={constitutionValue}
      resources={resources}
      onResourcesUpdate={onResourcesUpdate}
      hitDice={hitDice}
      onHitDiceUpdate={onHitDiceUpdate}
      hasHitDice={hasHitDice}
      onHasHitDiceChange={onHasHitDiceChange}
      hitDiceMode={hitDiceMode}
      onHitDiceModeChange={onHitDiceModeChange}
      characterId={characterId}
      characterName={characterName}
      onHeal={onHeal}
      availableForms={alternateForms}
      availableCompanions={companions}
      attributeNames={attributeNames}
      classDefenses={classDefenses}
      onClassDefensesChange={onClassDefensesChange}
    />
  );
}